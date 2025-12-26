
module.exports = {
  packagerConfig: {
    name: "VN AUDIO PRO",
    executableName: "VNAudioPro",
    icon: "./icon", // Sẽ tự nhận diện .ico trên Windows
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: "vn_audio_pro",
        setupIcon: "./icon.ico",
        setupExe: "VNAudioPro_Setup.exe",
        authors: "VN AUDIO PRO",
        description: "Advanced Neural TTS Studio"
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'win32'],
    },
  ],
};
