# Random Leader Squadron
WIP Web tool for selecting random squadrons for DVG's Leader series of games.

I like these games because they are the right depth of wargame for me, and about planning with lots of options, not worrying about historical details too much, then making pew-pew noises with neat little planes, and maybe imagining volleyball games with the pilots. I just think they're neat.

In these games, there is an optional rule to select squadrons at random, and this is my favoured way to play. But it takes a long time to prepare, and later Leader games have hundreds of pilots, which make it very complicated. 

There are a few examples of this kind of tool, such as [FragDaddy's DVG Leader Games squad randomizer](https://boardgamegeek.com/filepage/226394/dvg-leader-games-squad-randomizer) and [Blue Maxima's Warfighter randomiser](https://bluemaxima.org/warfighter/).

However I wanted to make a version of this tool that was:
- Web based
- Allows 'nudging' criteria and final selection (balance squad, eliminate specific aircraft)
- Focussed on year instead of campaigns (to support custom campaigns)

Built on:
- Vanilla JS, HTML and CSS
- Uses the Orbitron font (OFL)
- Adjectives courtesy of <a href="https://github.com/baliw">Daniel Walton</a>
- Animal names adapted from <a href="https://gist.github.com/borlaym/585e2e09dd6abd9b0d0a">Marton Borlay</a>

## Potential future features (not immediately planned)
- Support for more Leader games (even non-Air leader, where it makes sense)
- Printable squadron sheets (but that requires data on promotion)
- Support for random skills (e.g. to a value of SOs, or per pilot, or randomly)

## Log

- First I am working with Eagle Leader because it is the one I want to play and I'd rather write a whole web app than shuffle and re-sort all those pilots!
- Data principle: SO is positive for gains, negative for costs

## To fix
- Error handling where there are too few pilots in the pool
- better button styling
- bsky link