import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import * as cdk from 'aws-cdk-lib';
import { ResotoHelmChartAddOn } from '../lib/resoto-helm-chart-stack';

const addons = [
    new blueprints.addons.EbsCsiDriverAddOn(),
    new ResotoHelmChartAddOn(), 
];

const clusterProvider = new blueprints.MngClusterProvider({
    minSize: 1,
    maxSize: 2,
    instanceTypes: [new ec2.InstanceType('t3.medium')],
    amiType: eks.NodegroupAmiType.AL2_X86_64,
    version: eks.KubernetesVersion.of('1.23'),
});

export const buildEksBlueprint = (app: cdk.App, name: string) => blueprints.EksBlueprint.builder()
    .addOns(...addons)
    .clusterProvider(clusterProvider)
    .build(app, name);
