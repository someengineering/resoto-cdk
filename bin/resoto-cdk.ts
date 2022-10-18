#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ResotoHelmChartStack } from '../lib/resoto-helm-chart-stack';
import { buildEksBlueprint } from '../lib/eks-stack';

const app = new cdk.App();

const eksStack = buildEksBlueprint(app, 'resoto-eks-stack');
const cluster = eksStack.getClusterInfo().cluster;
new ResotoHelmChartStack(app, 'resoto-helm-chart-stack', cluster, {});