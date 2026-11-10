using System;
using System.Diagnostics;
using System.IO;

namespace SharkQuantApp
{
    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            try
            {
                string targetUrl = "https://shark-quant-backend-auw2-blue.vercel.app/app";
                string localData = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "SharkTradersAI", "UserData");

                if (!Directory.Exists(localData))
                {
                    Directory.CreateDirectory(localData);
                }

                // Check for Edge or Chrome
                string edgePath = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
                if (!File.Exists(edgePath)) edgePath = @"C:\Program Files\Microsoft\Edge\Application\msedge.exe";

                string chromePath = @"C:\Program Files\Google\Chrome\Application\chrome.exe";
                if (!File.Exists(chromePath)) chromePath = @"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe";

                string browserExe = File.Exists(edgePath) ? edgePath : (File.Exists(chromePath) ? chromePath : null);

                if (browserExe != null)
                {
                    ProcessStartInfo psi = new ProcessStartInfo
                    {
                        FileName = browserExe,
                        Arguments = string.Format("--app=\"{0}\" --user-data-dir=\"{1}\" --window-size=460,920 --window-position=450,50 --app-id=SharkTradersAI --disable-features=Translate,OptimizationGuideModelDownloading", targetUrl, localData),
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
                System.Windows.Forms.MessageBox.Show("Error starting Shark Traders AI: " + ex.Message, "Shark Quant", System.Windows.Forms.MessageBoxButtons.OK, System.Windows.Forms.MessageBoxIcon.Error);
            }
        }
    }
}
