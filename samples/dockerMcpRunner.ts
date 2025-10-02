import { spawn } from 'child_process';
import { mcpShell, MCPStdinSubprocess } from '../dist/index.js';

export interface DockerMcpRunnerOptions {
  projectDir: string;
  imageName: string;
  verbose?: boolean;
  allowDebugLogging?: boolean;
  env?: Record<string, string>;
}

export class DockerMcpRunner {
  private projectDir: string;
  private imageName: string;
  private verbose: boolean;
  private env: Record<string, string>;

  constructor(options: DockerMcpRunnerOptions) {
    this.projectDir = options.projectDir;
    this.imageName = options.imageName;
    this.verbose = options.verbose ?? false;
    this.env = options.env ?? {};
  }

  /**
   * Build the Docker image for the MCP project
   */
  async build(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.verbose) {
        console.log(`🔨 Building ${this.imageName} image...`);
      }

      const buildProcess = spawn('docker', ['build', '-t', this.imageName, '.'], {
        cwd: this.projectDir,
        stdio: this.verbose ? ['inherit', 'inherit', 'inherit'] : ['inherit', 'pipe', 'pipe'],
      });

      let stderr = '';
      let stdout = '';

      if (!this.verbose) {
        buildProcess.stdout?.on('data', data => {
          stdout += data.toString();
        });

        buildProcess.stderr?.on('data', data => {
          stderr += data.toString();
        });
      }

      buildProcess.on('close', code => {
        if (code === 0) {
          if (this.verbose) {
            console.log(`✅ ${this.imageName} image built successfully`);
          }
          resolve();
        } else {
          if (!this.verbose) {
            console.error('Build output:', stdout);
            console.error('Build errors:', stderr);
          }
          reject(new Error(`${this.imageName} image build failed with code ${code}`));
        }
      });

      buildProcess.on('error', error => {
        reject(new Error(`Failed to start ${this.imageName} image build: ${error.message}`));
      });
    });
  }

  /**
   * Get the Docker run command for the MCP server
   */
  getDockerCommand(): string {
    const envFlags = Object.entries(this.env)
      .map(([key, value]) => {
        // Escape quotes in the value
        const escapedValue = value.replace(/"/g, '\\"');
        return `-e ${key}="${escapedValue}"`;
      })
      .join(' ');

    const baseCommand = `docker run --rm -i`;
    return envFlags
      ? `${baseCommand} ${envFlags} ${this.imageName}`
      : `${baseCommand} ${this.imageName}`;
  }

  /**
   * Check if a Docker image exists
   */
  static async imageExists(imageName: string): Promise<boolean> {
    return new Promise(resolve => {
      const checkProcess = spawn('docker', ['inspect', imageName], {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      checkProcess.on('close', code => {
        resolve(code === 0);
      });

      checkProcess.on('error', () => {
        resolve(false);
      });
    });
  }

  /**
   * Helper to build and launch a Docker-based MCP server
   * This combines build and launch steps for convenience
   *
   * @param options.projectDir - Directory containing the Dockerfile
   * @param options.imageName - Name for the Docker image
   * @param options.verbose - Enable verbose build output
   * @param options.allowDebugLogging - Allow debug logging from the MCP server
   * @param options.env - Environment variables to pass to the Docker container (e.g., { API_KEY: 'secret' })
   *
   * @example
   * ```ts
   * const app = await DockerMcpRunner.buildAndLaunch({
   *   projectDir: __dirname,
   *   imageName: 'my-mcp-server:latest',
   *   env: {
   *     API_KEY: process.env.API_KEY!,
   *     DEBUG: 'true'
   *   }
   * });
   * ```
   */
  static async buildAndLaunch(options: DockerMcpRunnerOptions): Promise<MCPStdinSubprocess> {
    const runner = new DockerMcpRunner(options);

    // Check if image exists, if not build it
    const exists = await DockerMcpRunner.imageExists(options.imageName);
    if (!exists) {
      await runner.build();
    } else if (options.verbose) {
      console.log(`✅ Image ${options.imageName} already exists, skipping build`);
    }

    // Create MCP subprocess using the Docker command
    const dockerCommand = runner.getDockerCommand();
    const subprocess = mcpShell(dockerCommand, {
      allowDebugLogging: options.allowDebugLogging ?? false,
    });

    return subprocess;
  }
}
