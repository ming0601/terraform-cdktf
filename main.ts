import { ComputeFirewall } from './.gen/providers/google/compute-firewall';
import { ComputeNetwork } from './.gen/providers/google/compute-network';
import { ComputeInstance } from './.gen/providers/google/compute-instance';
import { GoogleProvider } from './.gen/providers/google/google-provider';
import { Construct } from 'constructs';
import { App, TerraformStack, TerraformOutput } from 'cdktf';
import * as path from 'path'
import * as fs from 'fs'

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    const credentialsPath = path.join(process.cwd(), 'google.json')
    const credentials = fs.existsSync(credentialsPath) ? fs.readFileSync(credentialsPath).toString() : '{}'

    // define resources here
    new GoogleProvider(this, 'google', {
      project: 'tf-gcp-1',
      region: 'us-central1',
      zone: 'us-central1-c',
      credentials
    });

    new ComputeInstance(this, 'compute', {
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
      metadataStartupScript: 'sudo apt-get update && sudo apt-get install apache2 -y && echo \'<!doctype html><html><body><h1>Hello!</h1></body></html>\' | sudo tee /var/www/html/index.html'
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

    new TerraformOutput(this, 'ip', {
      value: "${google_compute_instance.network_interface.0.access_config.0.nat_ip}"
    });

  }
}

const app = new App();
new MyStack(app, 'typescript-gcp');
app.synth();
