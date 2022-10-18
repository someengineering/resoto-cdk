import { ClusterAddOn, ClusterInfo } from '@aws-quickstart/eks-blueprints/dist/spi';
import * as blueprints from '@aws-quickstart/eks-blueprints';


export class ResotoHelmChartAddOn implements ClusterAddOn {

  @blueprints.utils.dependable(blueprints.EbsCsiDriverAddOn.name)
  deploy(clusterInfo: ClusterInfo): void {

    const cluster = clusterInfo.cluster;

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

    const resotoChart = cluster.addHelmChart('resoto-helm-chart', {
      repository: 'https://helm.some.engineering',
      chart: 'resoto',
      release: 'resoto',
      values: {
        image: {
          tag: '2.4.3'
        },
        resotocore: {
          graphdb: {
            server: 'http://single-server:8529',
          },
        },
      },
      wait: true,
    });

    // ArrangoDB is required before resoto can be deployed
    resotoChart.node.addDependency(arrangoManifest);

  }
}