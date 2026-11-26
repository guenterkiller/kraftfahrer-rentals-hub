import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const powershell = process.env.POWERSHELL_BIN || 'pwsh';
const available = spawnSync(powershell, ['-NoProfile', '-Command', 'exit 0']).status === 0;
const source = readFileSync(new URL('../build-complete-dist.ps1', import.meta.url), 'utf8');
// Isolated command doubles: no network, installation, registrations or mail.
const harness = String.raw`
function global:git {
    if ($args[0] -eq 'clone') {
        if ($env:EXPORT_TEST_CASE -eq 'clone') { $global:LASTEXITCODE = 1; return }
        $work = $args[-1]
        New-Item -ItemType Directory -Path "$work/public", "$work/dist/assets", "$work/dist/prerender" -Force > $null
        Set-Content "$work/public/htaccess-ionos" 'same-config'
        Copy-Item "$work/public/htaccess-ionos" "$work/public/.htaccess"
        foreach ($name in @('index.html', '.htaccess', 'robots.txt', 'sitemap.xml', 'sw.js', 'manifest.webmanifest', 'admin-check.html', 'cookies.html', 'datenschutz.html')) {
            Set-Content "$work/dist/$name" 'fixture'
        }
        Set-Content "$work/dist/assets/app.js" 'fixture'
        Set-Content "$work/dist/prerender/index.html" 'fixture'
        if ($env:EXPORT_TEST_CASE -eq 'missing') { Microsoft.PowerShell.Management\Remove-Item "$work/dist/sw.js" }
        $global:LASTEXITCODE = 0
    } elseif ($args[0] -eq 'remote') {
        $global:LASTEXITCODE = 0
        'https://github.com/guenterkiller/kraftfahrer-rentals-hub.git'
    } elseif ($args[0] -eq 'rev-parse') {
        $global:LASTEXITCODE = 0
        'fixture-commit'
    } else { throw 'Unexpected git invocation' }
}
function global:npm {
    $global:LASTEXITCODE = 0
    if (($args[0] -eq 'ci' -and $env:EXPORT_TEST_CASE -eq 'install') -or
        ($args[0] -eq 'run' -and $env:EXPORT_TEST_CASE -eq 'build')) { $global:LASTEXITCODE = 1 }
}
function global:node {
    $global:LASTEXITCODE = 0
    if (($args[0] -eq 'scripts/check-lockfile.mjs' -and $env:EXPORT_TEST_CASE -eq 'lock') -or
        ($args[0] -eq 'scripts/validate-prerender.mjs' -and $env:EXPORT_TEST_CASE -eq 'validate')) { $global:LASTEXITCODE = 1 }
}
function global:Remove-Item {
    param($Path, [switch]$Recurse, [switch]$Force, $ErrorAction)
    if ($env:EXPORT_TEST_CASE -eq 'cleanup' -and $Path.EndsWith('kraftfahrer-build-temp')) { throw 'Simulated cleanup failure' }
    Microsoft.PowerShell.Management\Remove-Item -LiteralPath $Path -Recurse:$Recurse -Force:$Force -ErrorAction Stop
}
`;

for (const scenario of ['clone', 'lock', 'install', 'build', 'validate', 'missing', 'cleanup', 'success']) {
  test(`PowerShell export ${scenario}: correct exit code and no false success`, { skip: !available }, () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'kraftfahrer-export-test-'));
    try {
      const script = path.join(dir, 'export.ps1');
      writeFileSync(script, '\uFEFF' + source.replace(/^\uFEFF/, '').replace('[Environment]::GetFolderPath("Desktop")', '$env:EXPORT_TEST_ROOT'), 'utf8');
      const wrapper = path.join(dir, 'run.ps1');
      writeFileSync(wrapper, harness + '\n& (Join-Path $env:EXPORT_TEST_ROOT "export.ps1")\nexit $LASTEXITCODE\n', 'utf8');
      const result = spawnSync(powershell, ['-NoProfile', '-File', wrapper], {
        env: { ...process.env, EXPORT_TEST_ROOT: dir, EXPORT_TEST_CASE: scenario }, encoding: 'utf8', timeout: 30000,
      });
      const output = result.stdout + result.stderr;
      assert.equal(result.status, scenario === 'success' ? 0 : 1, output);
      assert.equal(output.includes('=== BUILD ABGESCHLOSSEN ==='), scenario === 'success', output);
      const exported = path.join(dir, 'kraftfahrer-fertig');
      assert.equal(existsSync(exported), scenario === 'success', output);
      if (scenario === 'success') {
        assert.equal(readFileSync(path.join(exported, 'sw.js'), 'utf8').trim(), 'fixture');
        assert.match(readFileSync(path.join(exported, 'version.txt'), 'utf8'), /fixture-commit/);
        assert.equal(existsSync(path.join(dir, 'kraftfahrer-build-temp')), false);
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
}