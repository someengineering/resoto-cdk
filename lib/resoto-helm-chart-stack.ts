import { ClusterAddOn, ClusterInfo } from '@aws-quickstart/eks-blueprints/dist/spi';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import { Construct } from 'constructs';
import { CfnJson, CfnParameter } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';

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

    const kubeArrahgodb = cluster.addHelmChart('kube-arangodb-helm-chart', {
      repository: 'https://arangodb.github.io/kube-arangodb',
      chart: 'kube-arangodb',
      release: 'kube-arangodb',
      wait: true,
    });

    // crd will be installed before the operator
    kubeArrahgodb.node.addDependency(kubeArrangodbCrd);

    const arrangoManifest = cluster.addManifest('arango-deployment', {
      apiVersion: 'database.arangodb.com/v1alpha',
      kind: 'ArangoDeployment',
      metadata: {
        name: 'single-server',
      },
      spec: {
        mode: 'Single',
        image: 'arangodb/arangodb:3.8.7',
        tls: {
          caSecretName: 'None',
        },
      },
    });

    // operator is required before the deployment
    arrangoManifest.node.addDependency(kubeArrahgodb);

    const cfnTag = new CfnParameter(clusterInfo.getResourceContext().scope, 'ResotoTag', {
      type: 'String',
      description: 'Version of Resoto to install',
      default: '2.4.4',
    });

    const resotoChart = cluster.addHelmChart('resoto-helm-chart', {
      repository: 'https://helm.some.engineering',
      chart: 'resoto',
      release: 'resoto',
      values: {
        image: {
          tag: cfnTag.valueAsString,
        },
        resotocore: {
          graphdb: {
            server: 'http://single-server:8529',
          },
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

    // ArrangoDB is required before resoto can be deployed
    resotoChart.node.addDependency(arrangoManifest);
    resotoChart.node.addDependency(resotoHelmServiceAccount);

    return Promise.resolve(resotoChart);

  }
}