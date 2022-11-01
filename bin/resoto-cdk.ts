#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { buildEksBlueprint } from '../lib/eks-stack';

const app = new cdk.App();

const eksStack = buildEksBlueprint(app, 'resoto-eks-stack');
// Update the stack description from the blueprint generated one
eksStack.templateOptions.description = 'Resoto - Automate tedious infrastructure tasks, remarkably fast! https://resoto.com';