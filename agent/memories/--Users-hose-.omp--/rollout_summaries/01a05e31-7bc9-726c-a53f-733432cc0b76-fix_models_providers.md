thread_id: 01a05e31-7bc9-726c-a53f-733432cc0b76
updated_at: 1788291923

Fix OMP models.yml schema error where `providers:` parses as null; replace with explicit empty mapping `providers: {}` and verify via YAML check and omp --version.
