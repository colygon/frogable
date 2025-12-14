import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import os from 'os';

export const dynamic = 'force-dynamic';

// Simple terminal implementation using child_process
export async function POST(
  request: NextRequest,
  { params }: { params: { project_id: string } }
) {
  const projectId = params.project_id;

  try {
    const { command } = await request.json();

    if (!command) {
      return NextResponse.json({ error: 'Command is required' }, { status: 400 });
    }

    // Get project directory
    const projectsDir = path.join(os.homedir(), 'projects');
    const projectPath = path.join(projectsDir, projectId);

    return new Promise((resolve) => {
      const child = spawn(command, [], {
        cwd: projectPath,
        shell: true,
        env: { ...process.env, FORCE_COLOR: '1' },
      });

      let output = '';
      let error = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        error += data.toString();
      });

      child.on('close', (code) => {
        resolve(NextResponse.json({
          output,
          error,
          exitCode: code,
        }));
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        child.kill();
        resolve(NextResponse.json({
          output,
          error: error + '\\nCommand timed out',
          exitCode: -1,
        }));
      }, 30000);
    });
  } catch (error) {
    console.error('Terminal error:', error);
    return NextResponse.json(
      { error: 'Failed to execute command' },
      { status: 500 }
    );
  }
}