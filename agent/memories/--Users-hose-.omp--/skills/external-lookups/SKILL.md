# External lookup recipes

## X/Twitter
- Direct reads: twitter-blocked; Nitter dead.
- Working: `curl 'https://cdn.syndication.twimg.com/tweet-result?id=<tweet_id>&lang=en&token=x'` → Tweet JSON (text, favorite_count, created_at, user, entities).
- X Articles: syndication API with the article ID returns error HTML — open the article URL in a browser instead.
- Tweet text may be just a t.co link → expand entities.

## Baku local services
- Taxi (Bolt / Yandex Go / Yango, AZN): disambiguate venue names first (multiple candidates), use Yandex Maps taxi tab for live estimate; tariffs volatile — re-verify per run, time-stamp answers. Cannot actually book — estimates only. Answer in Russian.
- Diet Line (@diet_line.az, verified, +994 99 888 0 1234): 450 AZN ~22 weekdays / 550 AZN full month ⇒ ~6–8 AZN/meal, below Baku market (>20 AZN/day competitors). Before recommending, confirm: days covered, delivery zone, standard vs keto, sample menu; note calorie-restricted portions are by design.

## Homebrew / macOS toolchain
- brew failing with "CLT does not support macOS 26": version skew between CLT and macOS. Diagnose: xcode-select -p, pkgutil --pkg-info=com.apple.pkg.CLTools_Executables, sw_vers, brew config. Agent cannot run `sudo xcode-select --install` (needs password + GUI dialog); hand off to user, never run destructive `sudo rm -rf /Library/Developer/CommandLineTools` unprompted. Check sudo need via `sudo -n true`.
