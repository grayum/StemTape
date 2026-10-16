#!/usr/bin/env python3
"""Allow only tracked dist files; inspect the upload action's actual tar byte-for-byte."""
from pathlib import Path, PurePosixPath
import subprocess
import sys
import tarfile

root = Path(__file__).resolve().parents[1]
dist = root / 'dist'
expected = set(subprocess.check_output(
    ['git', 'ls-files', '-z', 'dist/'], cwd=root).decode().strip('\0').split('\0'))
expected = {p.removeprefix('dist/') for p in expected if p}
assert 'index.html' in expected and '.well-known/security.txt' in expected
actual = set()
for path in dist.rglob('*'):
    name = path.relative_to(dist).as_posix()
    assert not path.is_symlink(), f'Symlink: {name}'
    assert path.name.lower() != 'cname', f'Custom domain file: {name}'
    if any(part.startswith('.') for part in path.relative_to(dist).parts):
        assert name in {'.well-known', '.well-known/security.txt'}, f'Hidden path: {name}'
    if path.is_file():
        actual.add(name)
assert actual == expected, f'Unexpected/missing dist files: {actual ^ expected}'
if len(sys.argv) > 1:
    seen = set()
    with tarfile.open(sys.argv[1], 'r:') as archive:
        for member in archive.getmembers():
            path = PurePosixPath(member.name)
            assert not path.is_absolute() and '..' not in path.parts, member.name
            name = path.as_posix().removeprefix('./')
            if member.isdir():
                assert name == '.' or any(p.startswith(name + '/') for p in expected), name
                continue
            assert member.isfile() and name in expected and name not in seen, member.name
            seen.add(name)
            assert archive.extractfile(member).read() == (dist / name).read_bytes(), name
    assert seen == expected, f'Archive omissions: {expected - seen}'
    print(f'PASS: artifact.tar contains exactly {len(seen)} verified dist files, including security.txt.')
else:
    print(f'PASS: {len(actual)} tracked dist files; no CNAME, links or unintended hidden files.')
