using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace SharkTradersAI
{
    public class MainForm : Form
    {
        [DllImport("shell32.dll", SetLastError = true)]
        private static extern void SetCurrentProcessExplicitAppUserModelID([MarshalAs(UnmanagedType.LPWStr)] string AppID);

        [DllImport("user32.dll")]
        private static extern bool SetForegroundWindow(IntPtr hWnd);

        [DllImport("user32.dll")]
        private static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

        private WebView2 webView;

        public MainForm()
        {
            this.Text = "SHARK TRADERS AI // Institutional Quant Terminal";
            this.Width = 520;
            this.Height = 940;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = Color.FromArgb(7, 9, 14);
            this.MinimumSize = new Size(420, 700);

            try
            {
                this.Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath);
            }
            catch { }

            webView = new WebView2();
            webView.Dock = DockStyle.Fill;
            webView.DefaultBackgroundColor = Color.FromArgb(7, 9, 14);
            this.Controls.Add(webView);

            this.Load += MainForm_Load;
        }

        private async void MainForm_Load(object sender, EventArgs e)
        {
            try
            {
                string uData = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "SharkTradersAI", "WebView2Data");
                if (!Directory.Exists(uData)) Directory.CreateDirectory(uData);

                var env = await CoreWebView2Environment.CreateAsync(null, uData);
                await webView.EnsureCoreWebView2Async(env);

                webView.CoreWebView2.Settings.IsStatusBarEnabled = false;
                webView.CoreWebView2.Settings.AreDevToolsEnabled = false;
                webView.CoreWebView2.Settings.IsZoomControlEnabled = false;

                // Handle Google OAuth and external links: open in Chrome!
                webView.CoreWebView2.NavigationStarting += (s, args) =>
                {
                    string u = args.Uri ?? "";
                    if (u.Contains("accounts.google.com") || u.Contains("/auth/v1/authorize") || u.Contains("bridge-callback"))
                    {
                        args.Cancel = true;
                        OpenInChromeOrBrowser(u);
                    }
                };

                webView.CoreWebView2.NewWindowRequested += (s, args) =>
                {
                    args.Handled = true;
                    OpenInChromeOrBrowser(args.Uri);
                };

                webView.CoreWebView2.WebMessageReceived += (s, args) =>
                {
                    try
                    {
                        string msg = args.TryGetWebMessageAsString();
                        if (!string.IsNullOrEmpty(msg) && msg.Contains("open_chrome"))
                        {
                            int idx = msg.IndexOf("http");
                            if (idx >= 0)
                            {
                                int endIdx = msg.IndexOf('"', idx);
                                string url = endIdx > idx ? msg.Substring(idx, endIdx - idx) : msg.Substring(idx);
                                url = url.Replace("\\", "");
                                OpenInChromeOrBrowser(url);
                            }
                        }
                    }
                    catch { }
                };

                webView.Source = new Uri("http://localhost:5000/app");
            }
            catch (Exception ex)
            {
                MessageBox.Show("Initialization error: " + ex.Message, "Shark Traders AI", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        public static void OpenInChromeOrBrowser(string url)
        {
            if (string.IsNullOrEmpty(url)) return;
            try
            {
                string chrome = @"C:\Program Files\Google\Chrome\Application\chrome.exe";
                if (!File.Exists(chrome)) chrome = @"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe";

                if (File.Exists(chrome))
                {
                    Process.Start(new ProcessStartInfo(chrome, "\"" + url + "\"") { UseShellExecute = false });
                    return;
                }
            }
            catch { }

            try
            {
                Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
            }
            catch { }
        }

        [STAThread]
        static void Main(string[] args)
        {
            bool createdNew;
            using (Mutex mutex = new Mutex(true, "Global\\SharkTradersAI_SingleInstance_Mutex_v2", out createdNew))
            {
                if (!createdNew)
                {
                    // Bring existing window to front
                    IntPtr hWnd = FindWindow(null, "SHARK TRADERS AI // Institutional Quant Terminal");
                    if (hWnd != IntPtr.Zero)
                    {
                        ShowWindow(hWnd, 9); // SW_RESTORE
                        SetForegroundWindow(hWnd);
                    }
                    return;
                }

                try
                {
                    SetCurrentProcessExplicitAppUserModelID("SharkTradersAI.QuantPlatform.1.0");
                }
                catch { }

                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);
                Application.Run(new MainForm());
            }
        }

        [DllImport("user32.dll", SetLastError = true)]
        static extern IntPtr FindWindow(string lpClassName, string lpWindowName);
    }
}
