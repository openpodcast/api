-- Open Podcast Analytics database schema

-- This schema contains the most current version of the database schema.
-- Therefore, the migration_id has to be incremented (see below) for each change.
-- On a fresh installation, no migrations are applied and this schema is created
-- Every change of the schema has to be applied here and in a corresponding migration file
-- to be able to update the database schema of an existing installation.

-- migration table to track applied migrations
CREATE TABLE IF NOT EXISTS migrations (
  migration_id INTEGER NOT NULL,
  migration_name VARCHAR(64) NOT NULL,
  migration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (migration_id)
);

-- -----------------------------------------
-- IMPORTANT: this is the schema version
-- ID has to be incremented for each change
INSERT INTO migrations (migration_id, migration_name) VALUES (14, 'genericHoster');
-- -----------------------------------------

CREATE TABLE IF NOT EXISTS events (
  account_id INTEGER NOT NULL,
  ev_userhash CHAR(64) AS (SHA2(CONCAT_WS("",JSON_UNQUOTE(ev_raw->"$.ip"),JSON_UNQUOTE(ev_raw->'$."user-agent"')), 256)) STORED,
  ev_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ev_raw JSON,
  PRIMARY KEY (account_id, ev_timestamp)
);

CREATE TABLE IF NOT EXISTS spotifyPodcastDetailedStreams (
  account_id INTEGER NOT NULL,
  sps_date DATE NOT NULL,
  sps_starts INTEGER NOT NULL,
  sps_streams INTEGER NOT NULL,
  PRIMARY KEY (account_id, sps_date)
);

CREATE TABLE IF NOT EXISTS spotifyEpisodeDetailedStreams (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  sps_date DATE NOT NULL,
  sps_starts INTEGER NOT NULL,
  sps_streams INTEGER NOT NULL,
  PRIMARY KEY (account_id, episode_id, sps_date)
);


CREATE TABLE IF NOT EXISTS spotifyPodcastListeners (
  account_id INTEGER NOT NULL,
  spl_date DATE NOT NULL,
  spl_count INTEGER NOT NULL,
  PRIMARY KEY (account_id, spl_date)
);

CREATE TABLE IF NOT EXISTS spotifyPodcastFollowers (
  account_id INTEGER NOT NULL,
  spf_date DATE NOT NULL,
  spf_count INTEGER NOT NULL,
  PRIMARY KEY (account_id, spf_date)
);

CREATE TABLE IF NOT EXISTS spotifyEpisodeListeners (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  spl_date DATE NOT NULL,
  spl_count INTEGER NOT NULL,
  PRIMARY KEY (account_id, episode_id, spl_date)
);

CREATE TABLE IF NOT EXISTS spotifyEpisodeAggregate (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  spa_date DATE NOT NULL,
  spa_facet CHAR(8) NOT NULL,
  spa_facet_type ENUM ('age','age_sum','country') NOT NULL, 
  spa_gender_not_specified INTEGER NOT NULL,
  spa_gender_female INTEGER NOT NULL,
  spa_gender_male INTEGER NOT NULL,
  spa_gender_non_binary INTEGER NOT NULL,
  PRIMARY KEY (account_id, episode_id, spa_date, spa_facet_type, spa_facet)
);

CREATE TABLE IF NOT EXISTS spotifyPodcastAggregate (
  account_id INTEGER NOT NULL,
  spa_date DATE NOT NULL,
  spa_facet CHAR(8) NOT NULL,
  spa_facet_type ENUM ('age','age_sum','country') NOT NULL, 
  spa_gender_not_specified INTEGER NOT NULL,
  spa_gender_female INTEGER NOT NULL,
  spa_gender_male INTEGER NOT NULL,
  spa_gender_non_binary INTEGER NOT NULL,
  PRIMARY KEY (account_id, spa_date, spa_facet_type, spa_facet)
);

CREATE TABLE IF NOT EXISTS spotifyEpisodePerformance (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  -- CURRENT_DATE not supported in MySQL < 8 and planetscale
  spp_date DATE NOT NULL DEFAULT (CURRENT_DATE),
  spp_median_percentage TINYINT unsigned NOT NULL DEFAULT '0',
  spp_median_seconds MEDIUMINT unsigned NOT NULL DEFAULT '0',
  spp_percentile_25 TINYINT unsigned NOT NULL DEFAULT '0',
  spp_percentile_50 TINYINT unsigned NOT NULL DEFAULT '0',
  spp_percentile_75 TINYINT unsigned NOT NULL DEFAULT '0',
  spp_percentile_100 TINYINT unsigned NOT NULL DEFAULT '0',
  spp_sample_rate MEDIUMINT unsigned NOT NULL DEFAULT '0',
  spp_sample_max INTEGER unsigned NOT NULL DEFAULT '0',
  spp_sample_seconds INTEGER unsigned NOT NULL DEFAULT '0',
  -- detailed samples stored as json to reduce rows in DB
  -- otherwise we would add e.g. 3000 rows for just one episode  
  spp_samples JSON NOT NULL,
  PRIMARY KEY (account_id, episode_id, spp_date)
);

CREATE TABLE IF NOT EXISTS spotifyPodcastMetadata (
  account_id INTEGER NOT NULL,
  spm_date DATE NOT NULL,
  spm_total_episodes INTEGER NOT NULL,
  spm_starts INTEGER NOT NULL,
  spm_streams INTEGER NOT NULL,
  spm_listeners INTEGER NOT NULL,
  spm_followers INTEGER NOT NULL,
  PRIMARY KEY (account_id, spm_date)
);

CREATE TABLE IF NOT EXISTS spotifyEpisodeMetadata (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  ep_name VARCHAR(2048) NOT NULL,
  ep_url VARCHAR(2048),
  ep_artwork_url VARCHAR(2048),
  ep_release_date DATE,
  ep_description TEXT,
  ep_explicit BOOLEAN,
  ep_duration INTEGER,
  ep_language VARCHAR(100),
  -- no clue what sparkLine is (was always empty)
  ep_spark_line JSON,
  ep_has_video BOOLEAN,
  PRIMARY KEY (account_id, episode_id)
);

CREATE TABLE IF NOT EXISTS spotifyEpisodeMetadataHistory (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  epm_date DATE NOT NULL,
  epm_starts INTEGER NOT NULL,
  epm_streams INTEGER NOT NULL,
  epm_listeners INTEGER NOT NULL,
  PRIMARY KEY (account_id, episode_id, epm_date)
);

-- Introduced by migration 12
CREATE TABLE IF NOT EXISTS podcastMetadata (
  account_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  artwork_url VARCHAR(255) NOT NULL,
  release_date DATE NOT NULL,
  url VARCHAR(255) NOT NULL,
  publisher VARCHAR(255) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (account_id)
);


CREATE TABLE IF NOT EXISTS appleEpisodeMetadata (
  account_id INTEGER NOT NULL,
  episode_id BIGINT NOT NULL,
  ep_name VARCHAR(2048) NOT NULL,
  ep_collection_name VARCHAR(255) NOT NULL,
  ep_release_datetime DATETIME NOT NULL,
  ep_release_date DATE NOT NULL,
  ep_guid VARCHAR(512) NOT NULL,
  ep_number INTEGER,
  ep_type VARCHAR(255) NOT NULL,
  PRIMARY KEY (account_id, episode_id)
);

CREATE TABLE IF NOT EXISTS appleEpisodeDetails (
  account_id INTEGER NOT NULL,
  episode_id BIGINT NOT NULL,
  -- CURRENT_DATE not supported in MySQL < 8 and planetscale
  aed_date DATE NOT NULL DEFAULT (CURRENT_DATE),
  aed_playscount INTEGER NOT NULL,
  aed_totaltimelistened BIGINT NOT NULL,
  aed_uniqueengagedlistenerscount INTEGER NOT NULL,
  aed_uniquelistenerscount INTEGER NOT NULL,
  aed_engagedplayscount INTEGER NOT NULL,
  aed_play_histogram JSON,
  aed_play_top_cities JSON,
  aed_play_top_countries JSON,
  aed_histogram_max_listeners INTEGER,
  aed_quarter1_median_listeners INTEGER,
  aed_quarter2_median_listeners INTEGER,
  aed_quarter3_median_listeners INTEGER,
  aed_quarter4_median_listeners INTEGER,
  PRIMARY KEY (account_id, episode_id,aed_date)
);

-- listeners values per day and per episode coming from the apple trends api
CREATE TABLE IF NOT EXISTS appleTrendsEpisodeListeners (
  account_id INTEGER NOT NULL,
  episode_id BIGINT NOT NULL,
  atl_date DATE NOT NULL,
  atl_playscount INTEGER NOT NULL,
  atl_totaltimelistened BIGINT NOT NULL,
  atl_uniqueengagedlistenerscount INTEGER NOT NULL,
  atl_uniquelistenerscount INTEGER NOT NULL,
  PRIMARY KEY (account_id, episode_id, atl_date)
);

-- listeners values per day and per podcast coming from the apple trends api
CREATE TABLE IF NOT EXISTS appleTrendsPodcastListeners (
  account_id INTEGER NOT NULL,
  atl_date DATE NOT NULL,
  atl_playscount INTEGER NOT NULL,
  atl_totaltimelistened BIGINT NOT NULL,
  atl_uniqueengagedlistenerscount INTEGER NOT NULL,
  atl_uniquelistenerscount INTEGER NOT NULL,
  PRIMARY KEY (account_id, atl_date)
);

-- store totallistened time for followers and nonfollowers
CREATE TABLE IF NOT EXISTS appleTrendsPodcastListeningTimeFollowerState (
  account_id INTEGER NOT NULL,
  atf_date DATE NOT NULL,
  atf_totaltimelistened_followers BIGINT NOT NULL,
  atf_totaltimelistened_nonfollowers BIGINT NOT NULL,
  PRIMARY KEY (account_id, atf_date)
);

-- followers, gained/lost values per day
CREATE TABLE IF NOT EXISTS appleTrendsPodcastFollowers (
  account_id INTEGER NOT NULL,
  atf_date DATE NOT NULL,
  -- values on the specific date
  atf_totalfollowers INTEGER NOT NULL,
  atf_totalunfollowers INTEGER NOT NULL,
  -- gained/lost followers compared to the previous day
  atf_gained INTEGER NOT NULL,
  atf_lost INTEGER NOT NULL,
  PRIMARY KEY (account_id, atf_date)
);

-- store upvote/downvote (thumbs up/down) per episode 
-- and identify user with ip and agent hash
CREATE TABLE IF NOT EXISTS feedbackVote (
  account_id INTEGER NOT NULL,
  episode_id BIGINT NOT NULL,
  user_hash VARCHAR(64) NOT NULL,
  agent VARCHAR(255) NOT NULL,
  vote TINYINT NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (account_id, episode_id, user_hash)
);

-- store comments per episode
-- and identify user with ip and agent hash
CREATE TABLE IF NOT EXISTS feedbackComment (
  account_id INTEGER NOT NULL,
  episode_id BIGINT NOT NULL,
  user_hash VARCHAR(64) NOT NULL,
  comment TEXT NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (account_id, episode_id, created)
);

-- store latest update events
-- current timestamp is used to identify the update
-- contains JSON with the update data
CREATE TABLE IF NOT EXISTS updates (
  account_id INTEGER NOT NULL,
  provider VARCHAR(64) NOT NULL,
  endpoint VARCHAR(64) NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_data JSON NOT NULL,
  PRIMARY KEY (created, account_id, endpoint)
);

-- automatically delete all updates older than 7 days
CREATE EVENT IF NOT EXISTS updates_cleanup
ON SCHEDULE EVERY 1 DAY
DO DELETE FROM updates WHERE created < DATE_SUB(NOW(), INTERVAL 3 DAY);

-- defines the different podcasts identified
-- by a podcast_id which currently named account_id (historical reasons)
-- should be renamed soon
CREATE TABLE IF NOT EXISTS podcasts (
  account_id INTEGER NOT NULL AUTO_INCREMENT,
  pod_name VARCHAR(2048) NOT NULL,
  -- 1 if should be monitored and alerts should be sent
  monitored BOOLEAN NOT NULL DEFAULT 1,
  PRIMARY KEY (account_id)
);

-- apple countries: id to country mapping
CREATE TABLE IF NOT EXISTS appleCountries (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code CHAR(2) NOT NULL,
  ccc CHAR(3) NOT NULL
);

INSERT INTO appleCountries (id, name, code, ccc) VALUES (4, "Afghanistan", "AF", "afg"),
(248, "Åland Islands", "AX", "ala"),
(8, "Albania", "AL", "alb"),
(12, "Algeria", "DZ", "dza"),
(16, "American Samoa", "AS", "asm"),
(20, "AndorrA", "AD", "and"),
(24, "Angola", "AO", "ago"),
(660, "Anguilla", "AI", "aia"),
(10, "Antarctica", "AQ", "ata"),
(28, "Antigua and Barbuda", "AG", "atg"),
(32, "Argentina", "AR", "arg"),
(51, "Armenia", "AM", "arm"),
(533, "Aruba", "AW", "abw"),
(36, "Australia", "AU", "aus"),
(40, "Austria", "AT", "aut"),
(31, "Azerbaijan", "AZ", "aze"),
(44, "Bahamas", "BS", "bhs"),
(48, "Bahrain", "BH", "bhr"),
(50, "Bangladesh", "BD", "bgd"),
(52, "Barbados", "BB", "brb"),
(112, "Belarus", "BY", "blr"),
(56, "Belgium", "BE", "bel"),
(84, "Belize", "BZ", "blz"),
(204, "Benin", "BJ", "ben"),
(60, "Bermuda", "BM", "bmu"),
(64, "Bhutan", "BT", "btn"),
(68, "Bolivia", "BO", "bol"),
(70, "Bosnia and Herzegovina", "BA", "bih"),
(72, "Botswana", "BW", "bwa"),
(74, "Bouvet Island", "BV", "bvt"),
(76, "Brazil", "BR", "bra"),
(86, "British Indian Ocean Territory", "IO", "iot"),
(96, "Brunei Darussalam", "BN", "brn"),
(100, "Bulgaria", "BG", "bgr"),
(854, "Burkina Faso", "BF", "bfa"),
(108, "Burundi", "BI", "bdi"),
(116, "Cambodia", "KH", "khm"),
(120, "Cameroon", "CM", "cmr"),
(124, "Canada", "CA", "can"),
(132, "Cape Verde", "CV", "cpv"),
(136, "Cayman Islands", "KY", "cym"),
(140, "Central African Republic", "CF", "caf"),
(148, "Chad", "TD", "tcd"),
(152, "Chile", "CL", "chl"),
(156, "China", "CN", "chn"),
(162, "Christmas Island", "CX", "cxr"),
(166, "Cocos (Keeling) Islands", "CC", "cck"),
(170, "Colombia", "CO", "col"),
(174, "Comoros", "KM", "com"),
(178, "Congo", "CG", "cog"),
(180, "Congo, The Democratic Republic of the", "CD", "cod"),
(184, "Cook Islands", "CK", "cok"),
(188, "Costa Rica", "CR", "cri"),
(384, "Cote D\'Ivoire", "CI", "civ"),
(191, "Croatia", "HR", "hrv"),
(192, "Cuba", "CU", "cub"),
(196, "Cyprus", "CY", "cyp"),
(203, "Czech Republic", "CZ", "cze"),
(208, "Denmark", "DK", "dnk"),
(262, "Djibouti", "DJ", "dji"),
(212, "Dominica", "DM", "dma"),
(214, "Dominican Republic", "DO", "dom"),
(218, "Ecuador", "EC", "ecu"),
(818, "Egypt", "EG", "egy"),
(222, "El Salvador", "SV", "slv"),
(226, "Equatorial Guinea", "GQ", "gnq"),
(232, "Eritrea", "ER", "eri"),
(233, "Estonia", "EE", "est"),
(231, "Ethiopia", "ET", "eth"),
(238, "Falkland Islands (Malvinas)", "FK", "flk"),
(234, "Faroe Islands", "FO", "fro"),
(242, "Fiji", "FJ", "fji"),
(246, "Finland", "FI", "fin"),
(250, "France", "FR", "fra"),
(254, "French Guiana", "GF", "guf"),
(258, "French Polynesia", "PF", "pyf"),
(260, "French Southern Territories", "TF", "atf"),
(266, "Gabon", "GA", "gab"),
(270, "Gambia", "GM", "gmb"),
(268, "Georgia", "GE", "geo"),
(276, "Germany", "DE", "deu"),
(288, "Ghana", "GH", "gha"),
(292, "Gibraltar", "GI", "gib"),
(300, "Greece", "GR", "grc"),
(304, "Greenland", "GL", "grl"),
(308, "Grenada", "GD", "grd"),
(312, "Guadeloupe", "GP", "glp"),
(316, "Guam", "GU", "gum"),
(320, "Guatemala", "GT", "gtm"),
(831, "Guernsey", "GG", "ggy"),
(324, "Guinea", "GN", "gin"),
(624, "Guinea-Bissau", "GW", "gnb"),
(328, "Guyana", "GY", "guy"),
(332, "Haiti", "HT", "hti"),
(334, "Heard Island and Mcdonald Islands", "HM", "hmd"),
(336, "Holy See (Vatican City State)", "VA", "vat"),
(340, "Honduras", "HN", "hnd"),
(344, "Hong Kong", "HK", "hkg"),
(348, "Hungary", "HU", "hun"),
(352, "Iceland", "IS", "isl"),
(356, "India", "IN", "ind"),
(360, "Indonesia", "ID", "idn"),
(364, "Iran, Islamic Republic Of", "IR", "irn"),
(368, "Iraq", "IQ", "irq"),
(372, "Ireland", "IE", "irl"),
(833, "Isle of Man", "IM", "imn"),
(376, "Israel", "IL", "isr"),
(380, "Italy", "IT", "ita"),
(388, "Jamaica", "JM", "jam"),
(392, "Japan", "JP", "jpn"),
(832, "Jersey", "JE", "jey"),
(400, "Jordan", "JO", "jor"),
(398, "Kazakhstan", "KZ", "kaz"),
(404, "Kenya", "KE", "ken"),
(296, "Kiribati", "KI", "kir"),
(408, "Korea, Democratic People\'S Republic of", "KP", "prk"),
(410, "Korea, Republic of", "KR", "kor"),
(414, "Kuwait", "KW", "kwt"),
(417, "Kyrgyzstan", "KG", "kgz"),
(418, "Lao People\'S Democratic Republic", "LA", "lao"),
(428, "Latvia", "LV", "lva"),
(422, "Lebanon", "LB", "lbn"),
(426, "Lesotho", "LS", "lso"),
(430, "Liberia", "LR", "lbr"),
(434, "Libyan Arab Jamahiriya", "LY", "lby"),
(438, "Liechtenstein", "LI", "lie"),
(440, "Lithuania", "LT", "ltu"),
(442, "Luxembourg", "LU", "lux"),
(446, "Macao", "MO", "mac"),
(807, "Macedonia, The Former Yugoslav Republic of", "MK", "mkd"),
(450, "Madagascar", "MG", "mdg"),
(454, "Malawi", "MW", "mwi"),
(458, "Malaysia", "MY", "mys"),
(462, "Maldives", "MV", "mdv"),
(466, "Mali", "ML", "mli"),
(470, "Malta", "MT", "mlt"),
(584, "Marshall Islands", "MH", "mhl"),
(474, "Martinique", "MQ", "mtq"),
(478, "Mauritania", "MR", "mrt"),
(480, "Mauritius", "MU", "mus"),
(175, "Mayotte", "YT", "myt"),
(484, "Mexico", "MX", "mex"),
(583, "Micronesia, Federated States of", "FM", "fsm"),
(498, "Moldova, Republic of", "MD", "mda"),
(492, "Monaco", "MC", "mco"),
(496, "Mongolia", "MN", "mng"),
(500, "Montserrat", "MS", "msr"),
(504, "Morocco", "MA", "mar"),
(508, "Mozambique", "MZ", "moz"),
(104, "Myanmar", "MM", "mmr"),
(516, "Namibia", "NA", "nam"),
(520, "Nauru", "NR", "nru"),
(524, "Nepal", "NP", "npl"),
(528, "Netherlands", "NL", "nld"),
(530, "Netherlands Antilles", "AN", "ant"),
(540, "New Caledonia", "NC", "ncl"),
(554, "New Zealand", "NZ", "nzl"),
(558, "Nicaragua", "NI", "nic"),
(562, "Niger", "NE", "ner"),
(566, "Nigeria", "NG", "nga"),
(570, "Niue", "NU", "niu"),
(574, "Norfolk Island", "NF", "nfk"),
(580, "Northern Mariana Islands", "MP", "mnp"),
(578, "Norway", "NO", "nor"),
(512, "Oman", "OM", "omn"),
(586, "Pakistan", "PK", "pak"),
(585, "Palau", "PW", "plw"),
(275, "Palestinian Territory, Occupied", "PS", "pse"),
(591, "Panama", "PA", "pan"),
(598, "Papua New Guinea", "PG", "png"),
(600, "Paraguay", "PY", "pry"),
(604, "Peru", "PE", "per"),
(608, "Philippines", "PH", "phl"),
(612, "Pitcairn", "PN", "pcn"),
(616, "Poland", "PL", "pol"),
(620, "Portugal", "PT", "prt"),
(630, "Puerto Rico", "PR", "pri"),
(634, "Qatar", "QA", "qat"),
(638, "Reunion", "RE", "reu"),
(642, "Romania", "RO", "rou"),
(643, "Russian Federation", "RU", "rus"),
(646, "RWANDA", "RW", "rwa"),
(654, "Saint Helena", "SH", "shn"),
(659, "Saint Kitts and Nevis", "KN", "kna"),
(662, "Saint Lucia", "LC", "lca"),
(666, "Saint Pierre and Miquelon", "PM", "spm"),
(670, "Saint Vincent and the Grenadines", "VC", "vct"),
(882, "Samoa", "WS", "wsm"),
(674, "San Marino", "SM", "smr"),
(678, "Sao Tome and Principe", "ST", "stp"),
(682, "Saudi Arabia", "SA", "sau"),
(686, "Senegal", "SN", "sen"),
(690, "Seychelles", "SC", "syc"),
(694, "Sierra Leone", "SL", "sle"),
(702, "Singapore", "SG", "sgp"),
(703, "Slovakia", "SK", "svk"),
(705, "Slovenia", "SI", "svn"),
(90, "Solomon Islands", "SB", "slb"),
(706, "Somalia", "SO", "som"),
(710, "South Africa", "ZA", "zaf"),
(239, "South Georgia and the South Sandwich Islands", "GS", "sgs"),
(724, "Spain", "ES", "esp"),
(144, "Sri Lanka", "LK", "lka"),
(736, "Sudan", "SD", "sdn"),
(740, "Suriname", "SR", "sur"),
(744, "Svalbard and Jan Mayen", "SJ", "sjm"),
(748, "Swaziland", "SZ", "swz"),
(752, "Sweden", "SE", "swe"),
(756, "Switzerland", "CH", "che"),
(760, "Syrian Arab Republic", "SY", "syr"),
(158, "Taiwan, Province of China", "TW", "twn"),
(762, "Tajikistan", "TJ", "tjk"),
(834, "Tanzania, United Republic of", "TZ", "tza"),
(764, "Thailand", "TH", "tha"),
(626, "Timor-Leste", "TL", "tls"),
(768, "Togo", "TG", "tgo"),
(772, "Tokelau", "TK", "tkl"),
(776, "Tonga", "TO", "ton"),
(780, "Trinidad and Tobago", "TT", "tto"),
(788, "Tunisia", "TN", "tun"),
(792, "Turkey", "TR", "tur"),
(795, "Turkmenistan", "TM", "tkm"),
(796, "Turks and Caicos Islands", "TC", "tca"),
(798, "Tuvalu", "TV", "tuv"),
(800, "Uganda", "UG", "uga"),
(804, "Ukraine", "UA", "ukr"),
(784, "United Arab Emirates", "AE", "are"),
(826, "United Kingdom", "GB", "gbr"),
(840, "United States", "US", "usa"),
(581, "United States Minor Outlying Islands", "UM", "umi"),
(858, "Uruguay", "UY", "ury"),
(860, "Uzbekistan", "UZ", "uzb"),
(548, "Vanuatu", "VU", "vut"),
(862, "Venezuela", "VE", "ven"),
(704, "Viet Nam", "VN", "vnm"),
(92, "Virgin Islands, British", "VG", "vgb"),
(850, "Virgin Islands, U.S.", "VI", "vir"),
(876, "Wallis and Futuna", "WF", "wlf"),
(732, "Western Sahara", "EH", "esh"),
(887, "Yemen", "YE", "yem"),
(894, "Zambia", "ZM", "zmb"),
(716, "Zimbabwe", "ZW", "zwe");

CREATE TABLE IF NOT EXISTS anchorEpisodesPage (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  web_episode_id VARCHAR(128) NOT NULL,
  PRIMARY KEY (account_id, episode_id, web_episode_id)
);

-- Add a secondary index to resolve the web_episode_id to the episode_id
CREATE INDEX idx_account_episode ON anchorEpisodesPage(account_id, web_episode_id, episode_id);

CREATE TABLE IF NOT EXISTS anchorAudienceSize (
  account_id INTEGER NOT NULL,
  date DATE NOT NULL,
  audience_size INTEGER NOT NULL,
  PRIMARY KEY (account_id, date)
);

CREATE TABLE IF NOT EXISTS anchorAggregatedPerformance (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  date DATE NOT NULL,
  percentile25 INTEGER NOT NULL,
  percentile50 INTEGER NOT NULL,
  percentile75 INTEGER NOT NULL,
  percentile100 INTEGER NOT NULL,
  average_listen_seconds INTEGER NOT NULL,
  PRIMARY KEY (account_id, episode_id, date)
);

CREATE TABLE IF NOT EXISTS anchorEpisodePerformance (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  date DATE NOT NULL,
  max_listeners INTEGER NOT NULL,
  samples JSON NOT NULL,
  PRIMARY KEY (account_id, episode_id, date)
);

CREATE TABLE IF NOT EXISTS anchorPlays (
  account_id INTEGER NOT NULL,
  date DATE NOT NULL,
  plays INTEGER NOT NULL,
  PRIMARY KEY (account_id, date)
);

CREATE TABLE IF NOT EXISTS anchorEpisodePlays (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  date DATE NOT NULL,
  plays INTEGER NOT NULL,
  PRIMARY KEY (account_id, episode_id, date)
);

CREATE TABLE IF NOT EXISTS anchorPlaysByAgeRange (
  account_id INTEGER NOT NULL,
  date DATE NOT NULL,
  age_range VARCHAR(128) NOT NULL,
  plays_percent FLOAT NOT NULL,
  PRIMARY KEY (account_id, date, age_range)
);

CREATE TABLE IF NOT EXISTS anchorPlaysByApp (
  account_id INTEGER NOT NULL,
  date DATE NOT NULL,
  app VARCHAR(128) NOT NULL,
  plays_percent FLOAT NOT NULL,
  PRIMARY KEY (account_id, date, app)
);

CREATE TABLE IF NOT EXISTS anchorPlaysByDevice(
  account_id INTEGER NOT NULL,
  date DATE NOT NULL,
  device VARCHAR(128) NOT NULL,
  plays_percent FLOAT NOT NULL,
  PRIMARY KEY (account_id, date, device)
);

CREATE TABLE IF NOT EXISTS anchorPlaysByGender (
  account_id INTEGER NOT NULL,
  date DATE NOT NULL,
  gender VARCHAR(128) NOT NULL,
  plays_percent FLOAT NOT NULL,
  PRIMARY KEY (account_id, date, gender)
);

CREATE TABLE IF NOT EXISTS anchorPlaysByGeo (
  account_id INTEGER NOT NULL,
  date DATE NOT NULL,
  geo VARCHAR(128) NOT NULL,
  plays_percent FLOAT NOT NULL,
  PRIMARY KEY (account_id, date, geo)
);

CREATE TABLE IF NOT EXISTS anchorPlaysByGeoCity (
  account_id INTEGER NOT NULL,
  date DATE NOT NULL,
  country VARCHAR(128) NOT NULL,
  city VARCHAR(128) NOT NULL,
  plays_percent FLOAT NOT NULL,
  PRIMARY KEY (account_id, date, country, city)
);

CREATE TABLE IF NOT EXISTS anchorPodcastEpisodes (
  account_id INTEGER NOT NULL,
  podcast_id VARCHAR(128) NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  date DATETIME NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url VARCHAR(512) NOT NULL,
  tracked_url VARCHAR(512),
  episode_image VARCHAR(512),
  share_link_path VARCHAR(512) NOT NULL,
  share_link_embed_path VARCHAR(512) NOT NULL,
  ad_count INTEGER NOT NULL,
  created DATETIME NOT NULL,
  publishOn DATETIME,
  duration BIGINT NOT NULL,
  hour_offset INTEGER NOT NULL,
  is_deleted BOOLEAN NOT NULL,
  is_published BOOLEAN NOT NULL,
  PRIMARY KEY (account_id, episode_id)
);

CREATE TABLE IF NOT EXISTS anchorTotalPlays (
  account_id INTEGER NOT NULL,
  date DATE NOT NULL,
  plays INTEGER NOT NULL,
  PRIMARY KEY (account_id, date)
);

CREATE TABLE IF NOT EXISTS anchorTotalPlaysByEpisode (
    account_id INTEGER NOT NULL,
    date DATE NOT NULL,
    episode_id VARCHAR(255) NOT NULL,
    plays INTEGER NOT NULL,
    PRIMARY KEY (account_id, date, episode_id)
);

CREATE TABLE IF NOT EXISTS anchorUniqueListeners (
    account_id INTEGER NOT NULL,
    date DATE NOT NULL,
    unique_listeners INTEGER NOT NULL,
    PRIMARY KEY (account_id, date)
);

-- Generic Host Suppport, introduced with migration 14

CREATE TABLE IF NOT EXISTS hosterPodcastMetadata (
  account_id INTEGER NOT NULL,
  hoster_id SMALLINT UNSIGNED NOT NULL,
  date DATE DEFAULT (CURRENT_DATE),
  name VARCHAR(2048) NOT NULL,
  -- Date is not part of the primary key
  -- because we only want to store the latest data
  PRIMARY KEY (account_id, hoster_id)
);

CREATE TABLE IF NOT EXISTS subdimensions (
    dim_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    dim_name CHAR(64) NOT NULL,
    PRIMARY KEY (dim_id),
    UNIQUE KEY (dim_name)
);

CREATE TABLE IF NOT EXISTS hosterPodcastMetrics (
  account_id INTEGER NOT NULL,
  hoster_id SMALLINT UNSIGNED NOT NULL,
  start DATETIME NOT NULL,
  end DATETIME NOT NULL,
  dimension ENUM(
    'downloads',
    'platforms',
    'clients',
    'sources'
  ) NOT NULL,
  subdimension SMALLINT UNSIGNED NOT NULL,
  value INTEGER NOT NULL,
  PRIMARY KEY (account_id, hoster_id, start, end, dimension, subdimension),
  CONSTRAINT fk_subdimension_podcast
    FOREIGN KEY (subdimension) REFERENCES subdimensions(dim_id)
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS hosterEpisodeMetadata (
  account_id INTEGER NOT NULL,
  hoster_id SMALLINT UNSIGNED NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  ep_name VARCHAR(2048) NOT NULL,
  ep_url VARCHAR(2048),
  -- Date could be NULL for unpublished episodes
  ep_release_date DATETIME,
  PRIMARY KEY (account_id, hoster_id, episode_id)
);

CREATE TABLE IF NOT EXISTS hosterEpisodeMetrics (
  account_id INTEGER NOT NULL,
  hoster_id SMALLINT UNSIGNED NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  start DATETIME NOT NULL,
  end DATETIME NOT NULL,
  dimension ENUM(
    'downloads',
    'platforms',
    'clients',
    'sources'
  ) NOT NULL,
  subdimension SMALLINT UNSIGNED NOT NULL,
  value INTEGER NOT NULL,
  PRIMARY KEY (account_id, hoster_id, episode_id, start, end, dimension, subdimension),
    CONSTRAINT fk_subdimension_episode
        FOREIGN KEY (subdimension) REFERENCES subdimensions(dim_id)
        ON DELETE RESTRICT
);
