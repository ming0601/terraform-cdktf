import { ComputeNetwork } from './.gen/providers/google/compute-network';
import { ComputeInstance } from './.gen/providers/google/compute-instance';
import { GoogleProvider } from './.gen/providers/google/google-provider';
import { Construct } from 'constructs';
import { App, TerraformStack, TerraformOutput } from 'cdktf';

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    // define resources here
    new GoogleProvider(this, 'google', {
      project: 'tf-gcp-1',
      region: 'us-central1',
      zone: 'us-central1-c'
    });

    const computeInstance = new ComputeInstance(this, 'compute', {
      machineType: 'f1-micro',
      name: 'tf-gcp-instance',
      bootDisk: [
        {
          autoDelete: true,
          initializeParams: [
            {
              image: '"debian-cloud/debian-9"'
            }
          ]
        }
      ],
      networkInterface: [
        {
          network: 'default'
        }
      ]
    });


    const vpcNetwork = new ComputeNetwork(this, 'vpc_network', {
      name: 'tf-gcp-network',
      autoCreateSubnetworks: true
    });

    new TerraformOutput(this, 'instance_id', {
      value: computeInstance.instanceId
    });

    new TerraformOutput(this, 'vpc_network_description', {
      value: vpcNetwork.description
    });
  }


}

const app = new App();
new MyStack(app, 'typescript-gcp');
app.synth();
