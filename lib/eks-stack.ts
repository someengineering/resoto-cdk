import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import * as cdk from 'aws-cdk-lib';
import { ResotoHelmChartAddOn } from './resoto-helm-chart-stack';


const eksAddOns = (disableAnalytics: boolean) => [
    new blueprints.addons.EbsCsiDriverAddOn(),
    new ResotoHelmChartAddOn(disableAnalytics),
];
const clusterProvider = new blueprints.MngClusterProvider({
    instanceTypes: [new ec2.InstanceType('r5a.xlarge')],
    amiType: eks.NodegroupAmiType.AL2_X86_64,
    version: eks.KubernetesVersion.V1_24,
});

export const buildEksBlueprint = (app: cdk.App, name: string) => {

    // used for internal development and testing
    const disableAnalytics = (app.node.tryGetContext("disableAnalytics") || false) !== false;

    const stack = blueprints.EksBlueprint.builder()
        .addOns(...eksAddOns(disableAnalytics))
        .clusterProvider(clusterProvider)
        .build(app, name, {
            description: 'EKS cluster with Resoto Helm chart.',
        });
    defineStackParameters(stack);
    return stack;
}


const defineStackParameters = (eksStack: cdk.Stack) => {

    const cfnMaxCapacity = new cdk.CfnParameter(eksStack, 'MngMaxSize', {
        type: 'Number',
        description: 'Maximum number of nodes in the cluster',
        minValue: 1,
        default: 3,
    });

    const cfnMinCapacity = new cdk.CfnParameter(eksStack, 'MngMinSize', {
        type: 'Number',
        description: 'Minimum number of nodes in the cluster',
        minValue: 1,
        default: 1,
    });

    const cfnDesiredCapacity = new cdk.CfnParameter(eksStack, 'MngDesiredSize', {
        type: 'Number',
        description: 'Desired number of nodes in the cluster',
        minValue: 1,
        default: 1,
    });

    const cfnMngInstanceType = new cdk.CfnParameter(eksStack, 'MngInstanceType', {
        type: 'String',
        description: 'Instance type for the managed node group',
        default: 'r5a.xlarge',
    });

    // A little bit of patching of the resulting stack. Unfortunately the eks blueprint package
    // does not have a native capability to set MNG properties via CFN Parameters.
    eksStack.node.children.filter(child => child instanceof eks.Cluster).forEach(cluser => {
        cluser.node.children.filter(child => child instanceof eks.Nodegroup).forEach(ng => {
            ng.node.children.filter(child => child instanceof eks.CfnNodegroup).forEach(cfnNg => {

                const nodegroup = cfnNg as eks.CfnNodegroup;

                nodegroup.addPropertyOverride("InstanceTypes.0", cfnMngInstanceType.valueAsString)
                nodegroup.addPropertyOverride("ScalingConfig.MaxSize", cfnMaxCapacity.valueAsNumber)
                nodegroup.addPropertyOverride("ScalingConfig.MinSize", cfnMinCapacity.valueAsNumber)
                nodegroup.addPropertyOverride("ScalingConfig.DesiredSize", cfnDesiredCapacity.valueAsNumber)
            })
        })
    });
};
