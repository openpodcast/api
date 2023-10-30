#!/bin/bash

# Check if fswatch is available
if ! command -v fswatch &> /dev/null; then
    echo "Error: fswatch command not found. Please install it"
    exit 1
fi

# Check if podcast ID is provided as the first parameter
if [ -z "$1" ]; then
    echo "Error: Podcast ID is required."
    exit 1
fi

# Podcast ID
PODCAST_ID="$1"

# If on macOS, use gdate instead of date
if [ "$(uname)" == "Darwin" ]; then
    if ! command -v gdate &> /dev/null; then
        echo "Error: gdate command not found. Please install it"
        exit 1
    fi

    # Use gdate instead of date
    date() {
        gdate "$@"
    }
fi

# Default start and end dates (1st of last month to last day of last month)
DEFAULT_START_DATE=$(date -d "$(date +%Y-%m-01) -1 month" +%Y-%m-%d)
DEFAULT_END_DATE=$(date -d "$(date +%Y-%m-01) -1 day" +%Y-%m-%d)

# Use provided start and end dates if available, otherwise use defaults
START_DATE=${2:-$DEFAULT_START_DATE}
END_DATE=${3:-$DEFAULT_END_DATE}

# Directory to watch
WATCH_DIR="./db_schema/queries/v1/"

echo "Watching directory: $WATCH_DIR"
echo "Using podcast ID: $PODCAST_ID in $START_DATE to $END_DATE"

while true; do
    # # Use inotifywait to monitor file changes in the directory
    # file=$(inotifywait -q -e modify --format "%w%f" "$WATCH_DIR")

    # Use fswatch to monitor file changes in the directory
    file=$(fswatch -1 "$WATCH_DIR")

    # Use sed to replace all placeholders occurences @start, @end, @podcast_id
    content=$(sed -e "s/@start/\"$START_DATE\"/g" -e "s/@end/\"$END_DATE\"/g" -e "s/@podcast_id/$PODCAST_ID/g" "$file")

    # Output the modified content
    echo "Modified File: $file"
    echo "===================="
    echo "$content"
    echo "===================="
done
