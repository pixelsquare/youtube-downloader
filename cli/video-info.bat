@echo off

set videoFile="out60"
set ext="mp4"

echo.

"../ffmpeg/bin/ffmpeg.exe" -i "output/%videoFile%.%ext%"

echo.
echo *** DETAILED INFO ***
echo.

"../ffmpeg/bin/ffprobe.exe" -v error -select_streams v:0 -show_entries stream=width,height,duration,bit_rate,codec_name,r_frame_rate,sample_aspect_ratio,display_aspect_ratio -of default=noprint_wrappers=1 "output/%videoFile%.%ext%"

echo.