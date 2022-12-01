import {ClusterAddOn, ClusterInfo} from '@aws-quickstart/eks-blueprints/dist/spi';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import {Construct} from 'constructs';
import {CfnJson, CfnParameter} from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as cdk from 'aws-cdk-lib';
import {ManagedPolicy} from "aws-cdk-lib/aws-iam";
import * as policies from "./policies"

export class ResotoHelmChartAddOn implements ClusterAddOn {

    @blueprints.utils.dependable(blueprints.EbsCsiDriverAddOn.name)
    deploy(clusterInfo: ClusterInfo): void | Promise<Construct> {

        const cluster = clusterInfo.cluster;
        const stack = clusterInfo.getResourceContext().scope;
        const openIdConnectProviderIssuer = cluster.openIdConnectProvider.openIdConnectProviderIssuer;
        const saNamespace = 'default';
        const saAccountName = 'resoto-helm-chart-sa';

        const openIdProviderCondition = new CfnJson(stack, 'openIdProviderCondition', {
            value: {
                [`${openIdConnectProviderIssuer}:sub`]: `system:serviceaccount:${saNamespace}:${saAccountName}`
            }
        });

        const resotoServiceAccountIamRole = new iam.Role(stack, 'ResotoServiceAccountIamRole', {
            roleName: 'resoto-service-account-iam-role',
            assumedBy: new iam.FederatedPrincipal(
                cluster.openIdConnectProvider.openIdConnectProviderArn,
                {
                    "StringEquals": openIdProviderCondition
                },
                "sts:AssumeRoleWithWebIdentity"
            ),
        });
        // We attach the AWS managed ReadOnlyAccess policy to the service account IAM role for simplicity.
        // This is not really required, since the collect policy should already define the required permissions.
        // Reason: The list of collected resources changes over time, and we want to make it easy for the user.
        resotoServiceAccountIamRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('ReadOnlyAccess'));

        // All detailed permissions to collect resources.
        resotoServiceAccountIamRole.addToPolicy(policies.collect);

        // All detailed permissions to do tag-update, tag-delete, and resource-delete.
        resotoServiceAccountIamRole.addToPolicy(policies.tag_update_delete);

        const resotoHelmServiceAccount = cluster.addServiceAccount('resoto-helm-chart-sa', {
            name: saAccountName,
            namespace: saNamespace,
            annotations: {
                'eks.amazonaws.com/role-arn': resotoServiceAccountIamRole.roleArn,
                'eks.amazonaws.com/sts-regional-endpoints': 'true'
            }
        });

        const kubeArrangodbCrd = cluster.addHelmChart('kube-arangodb-crd-helm-chart', {
            repository: 'https://arangodb.github.io/kube-arangodb',
            chart: 'kube-arangodb-crd',
            release: 'kube-arangodb-crd',
            wait: true,
        });

        const cfnTag = new CfnParameter(clusterInfo.getResourceContext().scope, 'ResotoTag', {
            type: 'String',
            description: 'Version of Resoto to install',
            default: '2.4.4',
        });

        // Create a secret that can be looked up more easily by the user.
        const psk = new secretsmanager.Secret(stack, 'ResotoPsk', {
            description: 'This is the secret that is shared to secure the communication between the Resoto components. Note: this key is stored as secret in Kubernetes. Changing the value here will not have have any effect.',
        });

        const resotoChart = cluster.addHelmChart('resoto-helm-chart', {
            repository: 'https://helm.some.engineering',
            chart: 'resoto',
            release: 'resoto',
            values: {
                psk: psk.secretValue.unsafeUnwrap(),
                image: {
                    tag: cfnTag.valueAsString,
                },
                resotocore: {
                    // Create a public reachable endpoint for the resoto service
                    service: {type: 'LoadBalancer'}
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

        // Add the secret arn to the output table
        new cdk.CfnOutput(stack, 'ResotoPskSecretArn', {
            description: 'The ARN of the secret that contains the PSK for Resoto',
            value: psk.secretArn,
            exportName: 'ResotoPsKSecretArn'
        });
        // Show the command to get the load balancer endpoint
        new cdk.CfnOutput(stack, 'ResotoAccessUICommand', {
            description: 'Command to get the external address to Resoto. Type this into your browser: https://<external_address>:8900 to access the Resoto UI.',
            value: 'kubectl get service resoto-resotocore -o wide'
        })
        // Show the command to access Resoto Shell
        new cdk.CfnOutput(stack, 'ResotoAccessShellCommand', {
            description: 'Command to access ResotoShell.',
            value: 'kubectl exec -it service/resoto-resotocore -- resh'
        })

        return Promise.resolve(resotoChart);
    }
}
