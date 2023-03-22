# Resoto CDK construct

This construct library provides a CDK construct for deploying a Resoto application to AWS. With it, you can deploy Resoto application to AWS using a single command.

## Installation

1. Install nodejs. This construct is tested with nodejs 18.x. A convenient way to install nodejs is to use [nvm](https://github.com/nvm-sh/nvm).
2. Install the required dependencies: `npm ci`
3. Use cdk to deploy the application: `npm run cdk deploy`

## Configuration

It is possible to override the cloudformation parameter in the construct.

```npm run cdk deploy -- --parameters ResotoTag={{version to use}}```

Note that we should separate the cdk arguments via `--` to avoid confusion with the arguments of the `npm run` command.

The following parameters can be customized:

- `ResotoTag`: The tag of the Resoto image to use. See [Resoto](https://resoto.com) for the latest version.
- `MngMaxSize`: The maximum number of instances in the k8s managed node group. The default value is `3`.
- `MngMinSize`: The minimum number of instances in the k8s managed node group. The default value is `1`.
- `MngDesiredSize`: The desired number of instances in the k8s managed node group. The default value is `1`.
- `MngInstanceType`: The instance type of the k8s managed node group. The default value is `r5a.xlarge`.

## Useful commands

* `npm run cdk deploy`      deploy this stack to your default AWS account/region
* `npm run cdk diff`        compare deployed stack with current state
* `npm run cdk synth`       emits the synthesized CloudFormation template
