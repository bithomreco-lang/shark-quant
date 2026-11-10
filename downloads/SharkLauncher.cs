using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Windows.Forms;

namespace SharkQuantLauncher
{
    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            try
            {
                string targetUrl = "https://shark-quant-backend-auw2-blue.vercel.app/app";
                string appName = "Shark Traders AI";
                string currentExe = Assembly.GetExecutingAssembly().Location;
                string installDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "SharkTradersAI");

                if (!Directory.Exists(installDir))
                {
                    Directory.CreateDirectory(installDir);
                }

                string installedExe = Path.Combine(installDir, "SharkTradersAI.exe");

                // 1. Install or update the executable with embedded Shark Icon
                if (!string.Equals(currentExe, installedExe, StringComparison.OrdinalIgnoreCase) && File.Exists(currentExe))
                {
                    try { File.Copy(currentExe, installedExe, true); } catch { }
                }

                string finalExe = File.Exists(installedExe) ? installedExe : currentExe;

                // 2. Create Desktop and Start Menu Shortcuts with native 3D Shark Icon (.lnk)
                CreateWindowsShortcut(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), appName, finalExe);
                CreateWindowsShortcut(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.StartMenu), "Programs"), appName, finalExe);

                // 3. Launch sleek phone-sized app window (430x890) using default user profile
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
                        Arguments = string.Format("--app=\"{0}\" --window-size=430,890", targetUrl),
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

        static void CreateWindowsShortcut(string folderPath, string appName, string targetPath)
        {
            try
            {
                Type shellType = Type.GetTypeFromProgID("WScript.Shell");
                if (shellType != null)
                {
                    dynamic shell = Activator.CreateInstance(shellType);
                    string shortcutPath = Path.Combine(folderPath, appName + ".lnk");
                    dynamic shortcut = shell.CreateShortcut(shortcutPath);
                    shortcut.TargetPath = targetPath;
                    shortcut.IconLocation = targetPath + ",0";
                    shortcut.Description = "Shark Traders AI — Institutional Trading Platform";
                    shortcut.Save();
                }
            }
            catch { }
        }
    }
}
