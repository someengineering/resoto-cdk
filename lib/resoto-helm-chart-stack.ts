import {ClusterAddOn, ClusterInfo} from '@aws-quickstart/eks-blueprints/dist/spi';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import {Construct} from 'constructs';
import {CfnJson, CfnParameter} from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib';
import * as policies from "./policies"

export class ResotoHelmChartAddOn implements ClusterAddOn {

    @blueprints.utils.dependable(blueprints.EbsCsiDriverAddOn.name)
    deploy(clusterInfo: ClusterInfo): void | Promise<Construct> {

        const cluster = clusterInfo.cluster;
        const stack = clusterInfo.getResourceContext().scope;
        const openIdConnectProviderIssuer = cluster.openIdConnectProvider.openIdConnectProviderIssuer;
        const saNamespace = 'default';
        const saAccountName = 'resoto-helm-chart';

        const openIdProviderCondition = new CfnJson(stack, 'openIdProviderCondition', {
            value: {
                [`${openIdConnectProviderIssuer}:sub`]: `system:serviceaccount:${saNamespace}:${saAccountName}`
            }
        });

        const resotoServiceAccountIamRole = new iam.Role(stack, 'ResotoRun', {
            assumedBy: new iam.FederatedPrincipal(
                cluster.openIdConnectProvider.openIdConnectProviderArn,
                {
                    "StringEquals": openIdProviderCondition
                },
                "sts:AssumeRoleWithWebIdentity"
            ),
        });

        // All detailed permissions to collect resources.
        resotoServiceAccountIamRole.addToPolicy(policies.collect);
        // All detailed permissions to do tag-update, tag-delete, and resource-delete.
        resotoServiceAccountIamRole.addToPolicy(policies.tag_update_delete);
        // Allow to assume the Resoto role.
        resotoServiceAccountIamRole.addToPolicy(policies.allow_role_assume);

        const resotoHelmServiceAccount = cluster.addServiceAccount('ResotoHelmChart', {
            name: saAccountName,
            namespace: saNamespace,
            annotations: {
                'eks.amazonaws.com/role-arn': resotoServiceAccountIamRole.roleArn,
                'eks.amazonaws.com/sts-regional-endpoints': 'true'
            }
        });

        const kubeArrangodbCrd = cluster.addHelmChart('KubeArangodbCrdHelmChart', {
            repository: 'https://arangodb.github.io/kube-arangodb',
            chart: 'kube-arangodb-crd',
            release: 'kube-arangodb-crd',
            wait: true,
        });

        const cfnTag = new CfnParameter(clusterInfo.getResourceContext().scope, 'ResotoTag', {
            type: 'String',
            description: 'Version of Resoto to install',
            default: '3.0.0',
        });

        const resotoChart = cluster.addHelmChart('ResotoHelmChart', {
            repository: 'https://helm.some.engineering',
            chart: 'resoto',
            release: 'resoto',
            values: {
                image: {
                    tag: cfnTag.valueAsString,
                },
                resotocore: {
                    // Create a public reachable endpoint for the resoto service
                    service: {type: 'LoadBalancer'},
                    // For internal testing: enable the next line
                    // extraArgs: ["--analytics-opt-out"]
                },
                // we want to use the already created service account
                // instead of creating a new one
                serviceAccount: {
                    create: false,
                    name: resotoHelmServiceAccount.serviceAccountName,
                },
            },
            wait: true,
        });

        // ArangoDB CRD is required before resoto can be deployed
        resotoChart.node.addDependency(kubeArrangodbCrd);
        resotoChart.node.addDependency(resotoHelmServiceAccount);

        // Get the resoto service endpoint.
        const core_service_address = cluster.getServiceLoadBalancerAddress("resoto-resotocore", {
            namespace: saNamespace,
            timeout: cdk.Duration.minutes(60),
        });

        // Add the secret arn to the output table
        new cdk.CfnOutput(stack, 'ResotoPskSecretArn', {
            description: 'Command to get the PSK secret to access Resoto',
            value: 'kubectl get secrets resoto-psk -o jsonpath="{.data.psk}" | base64 -d',
        });
        // Show the command to get the load balancer endpoint
        new cdk.CfnOutput(stack, 'ResotoUIAddress', {
            description: 'Resoto UI address',
            value: 'https://'+core_service_address+':8900'
        })
        // Show the command to access Resoto Shell
        new cdk.CfnOutput(stack, 'ResotoAccessShellCommand', {
            description: 'Command to access ResotoShell.',
            value: 'kubectl exec -it service/resoto-resotocore -- resh'
        })

        return Promise.resolve(resotoChart);
    }
}
