# 애드체크 30초 시연영상 인코딩: demo-video.mjs가 만든 프레임 → 30fps H.264 + Windows 한국어 음성(Heami) 나레이션
# 사용: powershell -File scripts/demo-video-encode.ps1 -Work <작업폴더(임시)> -Out <출력 mp4>
# 필요: ffmpeg, Windows 한국어 음성(Microsoft Heami Desktop)
param(
  [Parameter(Mandatory = $true)][string]$Work,
  [Parameter(Mandatory = $true)][string]$Out
)
$ErrorActionPreference = 'Stop'

# 나레이션 (시작 초, 문장) — 화면 장면 시각에 맞춤
$lines = @(
  @(0.2, '애드체크로 해시태그 끝에 협찬만 붙인 글을 점검해 볼게요.'),
  @(5.6, '점검하기를 누르면, 삼십 점, 위반 위험이 나와요.'),
  @(10.6, '문제 항목 세 개를 이유와 함께 알려 줍니다.'),
  @(15.1, '고친 글이 바로 만들어지고, 그대로 다시 점검하면,'),
  @(20.1, '백 점, 적합. 이대로 올리면 돼요.'),
  @(24.3, '통계에서는 내가 가장 자주 틀리는 항목, 표시 위치를 보여 줘요.')
)

Add-Type -AssemblyName System.Speech
$tts = New-Object System.Speech.Synthesis.SpeechSynthesizer
$tts.SelectVoice('Microsoft Heami Desktop')
$tts.Rate = 1  # 기본보다 조금 빠르게: 문장이 다음 장면 나레이션과 겹치지 않게
$inputs = @()
$filters = @()
for ($i = 0; $i -lt $lines.Count; $i++) {
  $wav = Join-Path $Work ("n$i.wav")
  $tts.SetOutputToWaveFile($wav)
  $tts.Speak($lines[$i][1])
  $tts.SetOutputToNull()
  $ms = [int]($lines[$i][0] * 1000)
  $inputs += @('-i', $wav)
  $filters += "[$($i + 1):a]aresample=48000,adelay=${ms}|${ms}[a$i]"
}
$tts.Dispose()

$mix = ($filters -join ';') + ';' + ((0..($lines.Count - 1) | ForEach-Object { "[a$_]" }) -join '') + "amix=inputs=$($lines.Count):normalize=0,apad,atrim=0:30[aout]"
Push-Location $Work
try {
  & ffmpeg -y -v error -f concat -safe 0 -i frames.txt @inputs `
    -filter_complex "[0:v]fps=30,scale=750:1624:flags=lanczos,format=yuv420p[v];$mix" `
    -map '[v]' -map '[aout]' -t 30 -c:v libx264 -preset slow -crf 20 -c:a aac -b:a 128k -movflags +faststart $Out
  if ($LASTEXITCODE -ne 0) { throw "ffmpeg 실패 ($LASTEXITCODE)" }
} finally { Pop-Location }
Write-Output "saved $Out"
