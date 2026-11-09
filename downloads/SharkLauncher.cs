using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

namespace SharkQuantLauncher
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            try
            {
                string targetUrl = "http://localhost:3000/app";
                string appName = "Shark Traders AI";
                string profileDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "SharkQuantProfile");

                if (!Directory.Exists(profileDir))
                {
                    Directory.CreateDirectory(profileDir);
                }

                // 1. Create Desktop and Start Menu Shortcuts
                CreateShortcut(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), appName, targetUrl);
                CreateShortcut(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.StartMenu), "Programs"), appName, targetUrl);

                // 2. Launch phone-sized app window (430x890)
                string edgePath = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
                if (!File.Exists(edgePath))
                {
                    edgePath = @"C:\Program Files\Microsoft\Edge\Application\msedge.exe";
                }
                string chromePath = @"C:\Program Files\Google\Chrome\Application\chrome.exe";

                string browserExe = File.Exists(edgePath) ? edgePath : (File.Exists(chromePath) ? chromePath : null);

                if (browserExe != null)
                {
                    ProcessStartInfo psi = new ProcessStartInfo
                    {
                        FileName = browserExe,
                        Arguments = string.Format("--app=\"{0}\" --window-size=430,890 --user-data-dir=\"{1}\"", targetUrl, profileDir),
                        UseShellExecute = false
                    };
                    Process.Start(psi);
                }
                else
                {
                    Process.Start(targetUrl);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error starting Shark Traders AI: " + ex.Message, "Shark Quant", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        static void CreateShortcut(string folderPath, string appName, string targetUrl)
        {
            try
            {
                string shortcutPath = Path.Combine(folderPath, appName + ".url");
                using (StreamWriter writer = new StreamWriter(shortcutPath))
                {
                    writer.WriteLine("[InternetShortcut]");
                    writer.WriteLine("URL=" + targetUrl);
                    writer.WriteLine("IconIndex=0");
                }
            }
            catch { }
        }
    }
}

