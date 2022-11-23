# Notes regarding the Apple Podcasters API

## Show Trends API

We import the following dimensions

- Listeners/by Episode -> fills tables `appleTrendsEpisodeListeners` and `appleTrendsPodcastListeners`
- Followers -> fills table `appleTrendsPodcastFollowers`
- Plays/by Episode -> covered by Listeners/by Episode (duplicated)
- Time listened/by Episode -> covered by Listeners/by Episode (duplicated)
