#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { buildEksBlueprint } from '../lib/eks-stack';

const app = new cdk.App();

const eksStack = buildEksBlueprint(app, 'resoto-eks-stack');