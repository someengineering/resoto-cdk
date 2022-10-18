import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import * as cdk from 'aws-cdk-lib';

const addons = [
    new blueprints.addons.EbsCsiDriverAddOn(),
];

const clusterProvider = new blueprints.MngClusterProvider({
    minSize: 2,
    maxSize: 2,
    // @ts-ignore
    instanceTypes: [new ec2.InstanceType('t3.large')],
    amiType: eks.NodegroupAmiType.AL2_X86_64,
    version: eks.KubernetesVersion.V1_21,
});

export const buildEksBlueprint = (app: cdk.App, name: string) => blueprints.EksBlueprint.builder()
    .addOns(...addons)
    .clusterProvider(clusterProvider)
    .build(app, name);
