import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';

const isWindows = process.platform === 'win32';
const adbExecutable = isWindows ? 'adb.exe' : 'adb';
const isDoctorMode = process.argv.includes('--doctor');
const require = createRequire(import.meta.url);

function getPathKey(envObj) {
  return Object.keys(envObj).find((key) => key.toLowerCase() === 'path') ?? 'PATH';
}

function getCandidateSdkRoots() {
  const roots = [
    process.env.ANDROID_SDK_ROOT,
    process.env.ANDROID_HOME,
    isWindows && process.env.LOCALAPPDATA
      ? path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk')
      : undefined,
    isWindows && process.env.USERPROFILE
      ? path.join(process.env.USERPROFILE, 'AppData', 'Local', 'Android', 'Sdk')
      : undefined,
    !isWindows && process.env.HOME
      ? path.join(process.env.HOME, 'Android', 'Sdk')
      : undefined,
  ];

  return [...new Set(roots.filter(Boolean))];
}

function findPlatformToolsDir() {
  for (const root of getCandidateSdkRoots()) {
    const platformToolsDir = path.join(root, 'platform-tools');
    const adbPath = path.join(platformToolsDir, adbExecutable);

    if (existsSync(adbPath)) {
      return platformToolsDir;
    }
  }

  return null;
}

function addPlatformToolsToEnv(platformToolsDir) {
  const envObj = { ...process.env };

  if (!platformToolsDir) {
    return envObj;
  }

  const pathKey = getPathKey(envObj);
  const rawPath = envObj[pathKey] ?? '';
  const segments = rawPath.split(path.delimiter).filter(Boolean);
  const alreadyExists = segments.some((segment) => {
    return isWindows
      ? segment.toLowerCase() === platformToolsDir.toLowerCase()
      : segment === platformToolsDir;
  });

  if (!alreadyExists) {
    segments.push(platformToolsDir);
    envObj[pathKey] = segments.join(path.delimiter);
  }

  return envObj;
}

function findAdbExecutable(envObj, platformToolsDir) {
  if (platformToolsDir) {
    const adbPath = path.join(platformToolsDir, adbExecutable);
    if (existsSync(adbPath)) {
      return adbPath;
    }
  }

  const locator = isWindows ? 'where.exe' : 'which';
  const lookup = spawnSync(locator, ['adb'], {
    env: envObj,
    encoding: 'utf8',
  });

  if (lookup.status !== 0 || !lookup.stdout) {
    return null;
  }

  const firstMatch = lookup.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  return firstMatch || null;
}

function listDevices(adbPath, envObj) {
  const result = spawnSync(adbPath, ['devices', '-l'], {
    env: envObj,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    return {
      ok: false,
      message: (result.stderr || result.stdout || '').trim(),
      lines: [],
    };
  }

  const lines = (result.stdout || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('List of devices attached'));

  return {
    ok: true,
    lines,
  };
}

function hasUnauthorizedDevice(deviceLines) {
  return deviceLines.some((line) => /\bunauthorized\b/i.test(line));
}

function printUnauthorizedHelp(deviceLines) {
  console.error('[android] A device is connected but not authorized for USB debugging.');
  console.error('[android] Current adb state:');
  for (const line of deviceLines) {
    console.error(`  ${line}`);
  }
  console.error('[android] Fix steps:');
  console.error('  1) Unlock your phone screen.');
  console.error('  2) In Developer options, tap "Revoke USB debugging authorizations".');
  console.error('  3) Reconnect USB and choose File Transfer (MTP).');
  console.error('  4) Accept the "Allow USB debugging" prompt on the phone.');
}

function getCapacitorRunCommand() {
  try {
    const capCliEntry = require.resolve('@capacitor/cli/bin/cap.js');
    return {
      command: process.execPath,
      args: [capCliEntry, 'run', 'android'],
    };
  } catch {
    if (isWindows) {
      return {
        command: 'cmd.exe',
        args: ['/d', '/s', '/c', 'npx cap run android'],
      };
    }

    return {
      command: 'npx',
      args: ['cap', 'run', 'android'],
    };
  }
}

function runCapacitor(envObj) {
  const runCommand = getCapacitorRunCommand();
  const result = spawnSync(runCommand.command, runCommand.args, {
    env: envObj,
    stdio: 'inherit',
  });

  if (typeof result.status === 'number') {
    process.exit(result.status);
  }

  console.error('[android] Failed to start Capacitor run command.');
  if (result.error?.message) {
    console.error(`[android] ${result.error.message}`);
  }
  process.exit(1);
}

const platformToolsDir = findPlatformToolsDir();
const runtimeEnv = addPlatformToolsToEnv(platformToolsDir);
const adbPath = findAdbExecutable(runtimeEnv, platformToolsDir);

if (!adbPath) {
  console.error('[android] Could not find adb (Android platform-tools).');
  console.error('[android] Install Android SDK platform-tools and/or set ANDROID_SDK_ROOT.');
  process.exit(1);
}

const deviceState = listDevices(adbPath, runtimeEnv);

if (!deviceState.ok) {
  console.error('[android] Unable to query adb devices.');
  if (deviceState.message) {
    console.error(`[android] ${deviceState.message}`);
  }
  process.exit(1);
}

if (hasUnauthorizedDevice(deviceState.lines)) {
  printUnauthorizedHelp(deviceState.lines);
  process.exit(1);
}

if (isDoctorMode) {
  console.log(`[android] adb: ${adbPath}`);
  if (deviceState.lines.length === 0) {
    console.log('[android] No connected devices detected.');
    console.log('[android] You can still run with an emulator if available.');
  } else {
    console.log('[android] Connected devices:');
    for (const line of deviceState.lines) {
      console.log(`  ${line}`);
    }
  }
  process.exit(0);
}

runCapacitor(runtimeEnv);
