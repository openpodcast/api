-- @doc
-- Simple health check endpoint that echoes back the provided date parameters.
-- Fields: Start Date, End Date, Result Status

SELECT @start as start, @end as end, "pong" as result