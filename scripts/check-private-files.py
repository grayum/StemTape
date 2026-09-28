#!/usr/bin/env python3
"""Conservative repository hygiene gate, not a replacement for a full secret scanner."""
import subprocess,re
paths=subprocess.check_output(['git','ls-files','-z']).decode().split('\0')
bad=[]
for p in filter(None,paths):
    example=p.endswith('.example') or '.example.' in p
    if example:continue
    if re.search(r'(^|/)(\.env($|\.)|runtime/|data/|compose\.yaml$|docker-compose\.yaml$)|\.(pem|key|sqlite\w*|db)$',p):bad.append(p)
    try:text=open(p,encoding='utf8').read()
    except (UnicodeError,OSError):continue
    if re.search(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{30,}',text):bad.append(p+' (credential pattern)')
if bad:raise SystemExit('Private artifacts must not be committed:\n'+'\n'.join(bad))
print('PASS: tracked file hygiene and basic credential patterns. Run a full secret scanner before release.')
