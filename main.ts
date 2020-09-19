import { ComputeFirewall } from './.gen/providers/google/compute-firewall';
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
      zone: 'us-central1-c',
      // TODO
      credentials: ''
    });

    const computeInstance = new ComputeInstance(this, 'compute', {
      machineType: 'f1-micro',
      name: 'tf-gcp-instance',
      bootDisk: [
        {
          autoDelete: true,
          initializeParams: [
            {
              image: 'debian-cloud/debian-9'
            }
          ]
        }
      ],
      networkInterface: [
        {
          network: 'default'
        }
      ],
      tags: ['http-server'],
      // TODO
      metadataStartupScript: ''
    });


    new ComputeNetwork(this, 'vpc_network', {
      name: 'tf-gcp-network',
      autoCreateSubnetworks: true
    });

    new ComputeFirewall(this, 'http-server', {
      name: 'default-allow-terraform',
      network: 'default',
      allow: [
        {
          protocol: 'tcp',
          ports: ['80']
        }
      ],
      sourceRanges: ['0.0.0.0/0'],
      targetTags: ['http-server']
    });

    const accessConfig = computeInstance.networkInterface[0].accessConfig;
    if (accessConfig) {
      new TerraformOutput(this, 'ip', {
        value: accessConfig[0].natIp
      });
    } else {
      new TerraformOutput(this, 'ip', {
        value: 'natIp is undefined!'
      });
    }

  }
}

const app = new App();
new MyStack(app, 'typescript-gcp');
app.synth();
