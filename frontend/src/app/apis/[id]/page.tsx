"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PortfolioLayout } from "@/components/portfolio-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Play, AlertCircle, CheckCircle2, Copy, Clock, Server, Activity, Braces, Link2, Terminal } from "lucide-react";
import { FadeInOnScroll } from "@/components/scroll-animations";

export default function ApiDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [api, setApi] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [urlPath, setUrlPath] = useState("");
  
  // Payload State
  const [schemaFields, setSchemaFields] = useState<any[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [rawBodyMode, setRawBodyMode] = useState(false);
  const [rawBody, setRawBody] = useState("{\n  \n}");

  // Response State
  const [sandboxResponse, setSandboxResponse] = useState<any>(null);
  const [sandboxStatus, setSandboxStatus] = useState<number | null>(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxTime, setSandboxTime] = useState<number>(0);

  useEffect(() => {
    const fetchApiDetail = async () => {
      try {
        const res = await fetch(`/api/public/endpoints/${id}`);
        if (!res.ok) throw new Error("API not found");
        
        const data = await res.json();
        const endpoint = data.endpoint;
        setApi(endpoint);
        
        const basePath = endpoint.path.startsWith("http") ? endpoint.path : (endpoint.path.startsWith("/") ? endpoint.path : `/${endpoint.path}`);
        setUrlPath(basePath);

        let parsedParams: any[] = [];
        if (endpoint.params) {
          try {
            const parsed = JSON.parse(endpoint.params);
            if (Array.isArray(parsed)) parsedParams = parsed;
            else if (typeof parsed === "object" && parsed !== null) {
              parsedParams = Object.keys(parsed).map(k => ({ name: k, type: typeof parsed[k], default: parsed[k] }));
            }
          } catch (e) {}
        }

        setSchemaFields(parsedParams);
        
        // Init form data
        const initialData: Record<string, any> = {};
        parsedParams.forEach(p => {
          initialData[p.name] = p.default !== undefined ? p.default : "";
        });
        setFormData(initialData);
        setRawBody(JSON.stringify(initialData, null, 2));

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchApiDetail();
  }, [id]);

  const handleTestApi = async () => {
    setSandboxLoading(true);
    setSandboxResponse(null);
    setSandboxStatus(null);
    const start = performance.now();

    try {
      let finalUrl = urlPath.startsWith("http") ? urlPath : `/api/execute${urlPath.startsWith("/") ? urlPath : `/${urlPath}`}`;
      const options: RequestInit = { 
        method: api.method,
        cache: 'no-store',
        headers: { "Content-Type": "application/json" }
      };

      const hasFile = !rawBodyMode && Object.values(formData).some(v => v instanceof File);

      if (api.method === "GET") {
        const params = new URLSearchParams();
        Object.entries(formData).forEach(([k, v]) => {
          if (v) params.append(k, String(v));
        });
        const qs = params.toString();
        if (qs) finalUrl += (finalUrl.includes("?") ? "&" : "?") + qs;
      } else {
        if (rawBodyMode) {
          options.body = rawBody;
        } else if (hasFile) {
          // Remove Content-Type so browser sets it automatically with boundary
          delete options.headers["Content-Type"];
          const fd = new FormData();
          Object.entries(formData).forEach(([k, v]) => {
            if (v !== "" && v !== undefined) fd.append(k, v);
          });
          options.body = fd;
        } else {
          options.body = JSON.stringify(formData);
        }
      }

      const res = await fetch(finalUrl, options);
      const end = performance.now();
      
      setSandboxStatus(res.status);
      setSandboxTime(Math.round(end - start));
      
      const resText = await res.text();
      try {
        setSandboxResponse(JSON.stringify(JSON.parse(resText), null, 2));
      } catch(e) {
        setSandboxResponse(resText);
      }
    } catch (err: any) {
      setSandboxStatus(500);
      setSandboxResponse(err.message || "Network error");
      setSandboxTime(Math.round(performance.now() - start));
    } finally {
      setSandboxLoading(false);
    }
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: "text-blue-600 bg-blue-100 ring-blue-500/20 dark:text-blue-400 dark:bg-blue-500/10 dark:ring-blue-500/20",
      POST: "text-emerald-600 bg-emerald-100 ring-emerald-500/20 dark:text-emerald-400 dark:bg-emerald-500/10 dark:ring-emerald-500/20",
      PUT: "text-amber-600 bg-amber-100 ring-amber-500/20 dark:text-amber-400 dark:bg-amber-500/10 dark:ring-amber-500/20",
      DELETE: "text-rose-600 bg-rose-100 ring-rose-500/20 dark:text-rose-400 dark:bg-rose-500/10 dark:ring-rose-500/20",
      PATCH: "text-violet-600 bg-violet-100 ring-violet-500/20 dark:text-violet-400 dark:bg-violet-500/10 dark:ring-violet-500/20",
    };
    return colors[method] || "text-slate-600 bg-slate-100 ring-slate-500/20 dark:text-slate-400 dark:bg-slate-500/10 dark:ring-slate-500/20";
  };

  const getPayloadObject = () => {
    if (api?.method === "GET") return {};
    if (rawBodyMode) {
      try { return JSON.parse(rawBody); } catch { return {}; }
    }
    return formData;
  };

  const generateCurl = () => {
    if (!api) return "";
    let finalUrl = urlPath.startsWith("http") ? urlPath : `${window.location.origin}/api/execute${urlPath.startsWith("/") ? urlPath : `/${urlPath}`}`;
    if (api.method === "GET") {
      const params = new URLSearchParams();
      Object.entries(formData).forEach(([k, v]) => { if (v) params.append(k, String(v)); });
      const qs = params.toString();
      if (qs) finalUrl += (finalUrl.includes('?') ? '&' : '?') + qs;
    }
    let curl = `curl -X ${api.method} "${finalUrl}"`;
    if (api.method !== "GET") {
      const hasFile = Object.values(formData).some(v => v instanceof File);
      if (hasFile && !rawBodyMode) {
        curl += ` \\\n  -H "Content-Type: multipart/form-data"`;
        Object.entries(formData).forEach(([k, v]) => {
          if (v instanceof File) {
            curl += ` \\\n  -F "${k}=@/path/to/${v.name}"`;
          } else if (v) {
            curl += ` \\\n  -F "${k}=${v}"`;
          }
        });
      } else {
        const payloadStr = JSON.stringify(getPayloadObject(), null, 2);
        curl += ` \\\n  -H "Content-Type: application/json"`;
        curl += ` \\\n  -d '${payloadStr}'`;
      }
    }
    return curl;
  };

  const generateFetch = () => {
    if (!api) return "";
    let finalUrl = urlPath.startsWith("http") ? urlPath : `${window.location.origin}/api/execute${urlPath.startsWith("/") ? urlPath : `/${urlPath}`}`;
    if (api.method === "GET") {
      const params = new URLSearchParams();
      Object.entries(formData).forEach(([k, v]) => { if (v) params.append(k, String(v)); });
      const qs = params.toString();
      if (qs) finalUrl += (finalUrl.includes('?') ? '&' : '?') + qs;
    }
    let fetchCode = `fetch("${finalUrl}", {\n  method: "${api.method}",`;
    if (api.method !== "GET") {
      const hasFile = Object.values(formData).some(v => v instanceof File);
      if (hasFile && !rawBodyMode) {
        fetchCode += `\n  // Note: FormData handles Content-Type automatically`;
        fetchCode += `\n  body: (() => {\n    const fd = new FormData();`;
        Object.entries(formData).forEach(([k, v]) => {
          if (v instanceof File) {
            fetchCode += `\n    fd.append("${k}", fileInput.files[0]); // Ensure you get the file from an input`;
          } else if (v) {
            fetchCode += `\n    fd.append("${k}", "${v}");`;
          }
        });
        fetchCode += `\n    return fd;\n  })()`;
      } else {
        const payloadStr = JSON.stringify(getPayloadObject(), null, 2).split('\\n').join('\\n  ');
        fetchCode += `\n  headers: { "Content-Type": "application/json" },`;
        fetchCode += `\n  body: JSON.stringify(${payloadStr})`;
      }
    }
    fetchCode += `\n})\n.then(r => r.json())\n.then(console.log);`;
    return fetchCode;
  };

  if (loading) return (
    <PortfolioLayout>
      <div className="flex h-[80vh] items-center justify-center bg-transparent">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-24 w-24 rounded-full border border-slate-200 dark:border-white/10 border-t-slate-800 dark:border-t-white/80 animate-spin"></div>
          <div className="h-16 w-16 rounded-full border border-primary/20 border-t-primary animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          <Activity className="absolute text-primary h-6 w-6 animate-pulse" />
        </div>
      </div>
    </PortfolioLayout>
  );

  if (error || !api) return (
    <PortfolioLayout>
      <div className="flex flex-col items-center justify-center h-[80vh] bg-transparent text-center space-y-6">
        <div className="h-20 w-20 rounded-full bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center">
          <AlertCircle className="h-10 w-10 text-rose-500" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Endpoint Not Found</h2>
        <Button onClick={() => router.push("/apis")} variant="outline" className="rounded-full px-8 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white"><ArrowLeft className="mr-2 h-4 w-4" /> Go Back</Button>
      </div>
    </PortfolioLayout>
  );

  return (
    <PortfolioLayout>
      <div className="min-h-[calc(100vh-4rem)] bg-transparent text-slate-900 dark:text-slate-200 selection:bg-primary/30 selection:text-white font-sans pb-12 transition-colors duration-300">
        
        {/* Subtle Background Glow (only very subtle in light mode) */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 flex justify-center">
          <div className="absolute top-[-20%] w-[800px] h-[400px] bg-primary/20 rounded-[100%] blur-[100px] md:blur-[120px] opacity-10 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen"></div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-8">
          
          {/* Top Header */}
          <FadeInOnScroll>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-200 dark:border-white/10 pb-8">
              <div className="space-y-4 w-full md:w-auto">
                <Button variant="link" onClick={() => router.push("/apis")} className="p-0 h-auto text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Directory
                </Button>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">{api.name}</h1>
                    <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ring-1 ring-inset ${getMethodColor(api.method)}`}>
                      {api.method}
                    </span>
                    {api.requiresAuth && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-1 ring-inset ring-orange-200 dark:ring-orange-500/20 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 dark:bg-orange-400 animate-pulse"></div> Auth
                      </span>
                    )}
                  </div>
                  <div className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed whitespace-pre-wrap max-h-[180px] overflow-y-auto custom-scrollbar pr-3">
                    {api.description || "No description provided."}
                  </div>
                </div>
              </div>
              
              <div className="flex w-full md:w-auto overflow-x-auto pb-2 md:pb-0 items-center gap-4 bg-white dark:bg-white/[0.03] p-1.5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none backdrop-blur-md">
                <div className="px-4 py-2 flex flex-col items-center border-r border-slate-100 dark:border-white/5 whitespace-nowrap">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold mb-1">Limit</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><Server className="h-3.5 w-3.5 text-primary" /> {api.rateLimit}/m</span>
                </div>
                <div className="px-4 py-2 flex flex-col items-center border-r border-slate-100 dark:border-white/5 whitespace-nowrap">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold mb-1">Status</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div> Active</span>
                </div>
                <div className="px-4 py-2 flex flex-col items-center whitespace-nowrap">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold mb-1">Latency</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-sky-500 dark:text-sky-400" /> &lt;50ms</span>
                </div>
              </div>
            </div>
          </FadeInOnScroll>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            
            {/* Left Column (Docs & Form) */}
            <div className="xl:col-span-7 space-y-8">
              
              {/* URL Bar */}
              <FadeInOnScroll delay={0.1}>
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white tracking-wide flex items-center gap-2"><Link2 className="h-4 w-4 text-primary" /> Endpoint URL</div>
                  <div className="flex items-center bg-white dark:bg-[#0d0d10] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 dark:focus-within:ring-primary/50 transition-all shadow-sm dark:shadow-[0_4px_20px_-10px_rgba(0,0,0,0.5)]">
                    <div className="px-4 py-3 border-r border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                      <span className={`text-[11px] font-black uppercase tracking-widest ${getMethodColor(api.method).split(' ')[0]}`}>{api.method}</span>
                    </div>
                    <Input 
                      value={urlPath}
                      onChange={(e) => setUrlPath(e.target.value)}
                      className="h-12 bg-transparent border-none text-sm font-mono text-slate-700 dark:text-slate-300 focus-visible:ring-0 placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-none w-full"
                    />
                  </div>
                </div>
              </FadeInOnScroll>

              {/* Dynamic Request Builder */}
              <FadeInOnScroll delay={0.2}>
                <div className="space-y-6 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl p-5 md:p-8 backdrop-blur-xl relative overflow-hidden shadow-sm dark:shadow-none">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                    <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><Braces className="h-5 w-5 text-primary" /> Request Parameters</div>
                    {api.method !== "GET" && (
                      <div className="flex items-center bg-slate-100 dark:bg-[#0d0d10] p-1 rounded-lg border border-slate-200 dark:border-white/5 w-fit">
                        <button onClick={() => setRawBodyMode(false)} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${!rawBodyMode ? 'bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Form</button>
                        <button onClick={() => setRawBodyMode(true)} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${rawBodyMode ? 'bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Raw JSON</button>
                      </div>
                    )}
                  </div>

                  {api.method !== "GET" && rawBodyMode ? (
                    <Textarea 
                      value={rawBody} 
                      onChange={e => setRawBody(e.target.value)} 
                      className="font-mono text-[13px] leading-relaxed min-h-[250px] bg-slate-900 dark:bg-[#0d0d10] text-emerald-400 border-slate-200 dark:border-white/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent p-6 rounded-xl shadow-inner" 
                      spellCheck={false}
                    />
                  ) : (
                    <div className="space-y-5">
                      {schemaFields.length === 0 ? (
                        <div className="py-10 text-center rounded-xl bg-slate-50 dark:bg-[#0d0d10] border border-dashed border-slate-300 dark:border-white/10 flex flex-col items-center justify-center gap-3">
                          <span className="h-10 w-10 rounded-full bg-white dark:bg-white/5 flex items-center justify-center shadow-sm dark:shadow-none"><Server className="h-4 w-4 text-slate-400 dark:text-slate-500" /></span>
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">No parameters required.</span>
                        </div>
                      ) : (
                        schemaFields.map((field, idx) => (
                          <div key={idx} className="group relative">
                            <label className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{field.name}</span>
                              {field.required && <span className="text-[9px] font-black uppercase tracking-widest text-rose-500 dark:text-rose-400 bg-rose-100 dark:bg-rose-400/10 px-2 py-0.5 rounded-full">Required</span>}
                            </label>
                            <Input 
                              type={field.type === "number" ? "number" : field.type === "file" ? "file" : "text"}
                              placeholder={field.description || `Enter value for ${field.name}...`}
                              value={field.type === "file" ? undefined : (formData[field.name] || "")}
                              onChange={(e) => {
                                if (field.type === "file" && e.target.files?.length) {
                                  setFormData({ ...formData, [field.name]: e.target.files[0] });
                                } else {
                                  setFormData({ ...formData, [field.name]: e.target.value });
                                }
                              }}
                              className="h-11 bg-slate-50 dark:bg-[#0d0d10] border-slate-200 dark:border-white/10 focus-visible:ring-2 focus-visible:ring-primary/50 text-sm font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-xl shadow-inner transition-all group-hover:border-slate-300 dark:group-hover:border-white/20"
                            />
                            {field.description && <p className="mt-2 text-[11px] text-slate-500 leading-normal">{field.description}</p>}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  <div className="pt-6 mt-6 border-t border-slate-100 dark:border-white/5">
                    <Button 
                      onClick={handleTestApi} 
                      disabled={sandboxLoading} 
                      className="w-full h-12 md:h-14 rounded-xl bg-primary text-white hover:bg-primary/90 dark:bg-white dark:text-black dark:hover:bg-slate-200 text-sm font-bold shadow-lg shadow-primary/20 dark:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all flex items-center justify-center gap-3 group"
                    >
                      {sandboxLoading ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black rounded-full animate-spin" />
                      ) : (
                        <><Play className="h-4 w-4 fill-current group-hover:scale-110 transition-transform" /> Send Request</>
                      )}
                    </Button>
                  </div>
                </div>
              </FadeInOnScroll>

              {/* Code Snippets */}
              <FadeInOnScroll delay={0.3}>
                <div className="bg-slate-50 dark:bg-[#050505] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
                  
                  {/* MacOS Header */}
                  <div className="h-12 bg-slate-100 dark:bg-[#0A0A0B] border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-4 select-none">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-400 dark:bg-rose-500/80 hover:bg-rose-500 transition-colors cursor-pointer"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400 dark:bg-amber-500/80 hover:bg-amber-500 transition-colors cursor-pointer"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-400 dark:bg-emerald-500/80 hover:bg-emerald-500 transition-colors cursor-pointer"></div>
                    </div>
                    <div className="text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
                      <Braces className="h-3.5 w-3.5" /> Integration Code
                    </div>
                    <div className="flex items-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-200 dark:hover:bg-white/10 transition-colors" onClick={() => navigator.clipboard.writeText(generateFetch())}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Tabs defaultValue="fetch" className="w-full flex flex-col">
                    <TabsList className="bg-transparent h-11 p-0 gap-6 px-4 border-b border-slate-200 dark:border-white/5">
                      <TabsTrigger value="fetch" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary text-slate-500 dark:text-slate-400 rounded-none px-0 h-full text-xs font-semibold hover:text-slate-900 dark:hover:text-slate-300 transition-colors">Fetch (Node.js)</TabsTrigger>
                      <TabsTrigger value="curl" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary text-slate-500 dark:text-slate-400 rounded-none px-0 h-full text-xs font-semibold hover:text-slate-900 dark:hover:text-slate-300 transition-colors">cURL</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="fetch" className="m-0 bg-slate-50 dark:bg-[#050505]">
                      <div className="p-4 md:p-6 overflow-x-auto custom-scrollbar">
                        <pre className="font-mono text-[12px] md:text-[13px] leading-[1.8] text-slate-700 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: highlightJS(generateFetch()) }} />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="curl" className="m-0 bg-slate-50 dark:bg-[#050505]">
                      <div className="p-4 md:p-6 overflow-x-auto custom-scrollbar">
                        <pre className="font-mono text-[12px] md:text-[13px] leading-[1.8] text-slate-700 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: highlightBash(generateCurl()) }} />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </FadeInOnScroll>

            </div>

            {/* Right Column (Terminal Viewer) */}
            <div className="xl:col-span-5 h-[500px] md:h-[600px] xl:h-[calc(100vh-14rem)] sticky top-24">
              <FadeInOnScroll delay={0.4} className="h-full">
                <div className="h-full flex flex-col bg-slate-50 dark:bg-[#050505] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-md dark:shadow-[0_0_50px_-15px_rgba(0,0,0,1)] ring-1 ring-slate-100 dark:ring-white/5 relative">
                  
                  {/* macOS like top bar */}
                  <div className="h-12 bg-slate-100 dark:bg-[#0A0A0B] border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-4 select-none shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-400 dark:bg-rose-500/80 hover:bg-rose-500 transition-colors cursor-pointer"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400 dark:bg-amber-500/80 hover:bg-amber-500 transition-colors cursor-pointer"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-400 dark:bg-emerald-500/80 hover:bg-emerald-500 transition-colors cursor-pointer"></div>
                    </div>
                    <div className="text-[11px] font-bold tracking-widest text-slate-500 uppercase flex items-center gap-2">
                      <Terminal className="h-3.5 w-3.5" /> Output Terminal
                    </div>
                    <div className="w-16"></div> {/* Spacer to center title */}
                  </div>

                  {/* Status Banner */}
                  {sandboxStatus && (
                    <div className={`px-4 py-2 text-xs font-mono font-semibold flex items-center justify-between border-b border-slate-200 dark:border-white/5 shrink-0 ${sandboxStatus >= 200 && sandboxStatus < 300 ? "bg-emerald-50 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-500/5 text-rose-600 dark:text-rose-400"}`}>
                      <span className="flex items-center gap-2">
                        {sandboxStatus >= 200 && sandboxStatus < 300 ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        HTTP {sandboxStatus}
                      </span>
                      <span className="flex items-center gap-1 opacity-80"><Clock className="h-3.5 w-3.5" /> {sandboxTime}ms</span>
                    </div>
                  )}

                  {/* Terminal Content */}
                  <div className="flex-1 overflow-auto relative custom-scrollbar bg-slate-50 dark:bg-[#050505]">
                    {sandboxLoading ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 dark:bg-[#050505]/80 backdrop-blur-sm z-10">
                        <div className="relative flex items-center justify-center">
                          <div className="h-16 w-16 border-[3px] border-slate-200 dark:border-white/10 rounded-full"></div>
                          <div className="absolute h-16 w-16 border-[3px] border-primary border-t-transparent rounded-full animate-spin"></div>
                          <Activity className="absolute h-6 w-6 text-primary animate-pulse" />
                        </div>
                        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse">Processing</p>
                      </div>
                    ) : sandboxResponse ? (
                      <div className="p-4 md:p-5 font-mono text-[12px] md:text-[13px] leading-relaxed break-words whitespace-pre-wrap">
                        {typeof sandboxResponse === 'string' && sandboxResponse.startsWith('{') ? (
                          <div dangerouslySetInnerHTML={{ __html: syntaxHighlight(sandboxResponse) }} />
                        ) : (
                          <span className="text-slate-800 dark:text-slate-300">{sandboxResponse}</span>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-700/50 space-y-6">
                        <div className="relative">
                          <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 blur-xl rounded-full"></div>
                          <Play className="h-16 w-16 opacity-20 relative z-10" />
                        </div>
                        <p className="text-xs font-mono font-bold tracking-widest uppercase text-slate-400 dark:text-slate-600">Waiting for Execution</p>
                      </div>
                    )}
                  </div>
                </div>
              </FadeInOnScroll>
            </div>

          </div>
        </div>
      </div>
    </PortfolioLayout>
  );
}

// Simple syntax highlighter helper for JSON
function syntaxHighlight(json: string) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    let cls = 'text-amber-600 dark:text-amber-400'; // number
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'text-sky-600 dark:text-sky-400 font-semibold'; // key
      } else {
        cls = 'text-emerald-600 dark:text-emerald-400'; // string
      }
    } else if (/true|false/.test(match)) {
      cls = 'text-violet-600 dark:text-violet-400 font-bold'; // boolean
    } else if (/null/.test(match)) {
      cls = 'text-rose-600 dark:text-rose-400 font-bold'; // null
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

function highlightJS(code: string) {
  let res = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let strings: string[] = [];
  res = res.replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, (match) => {
    strings.push(match);
    return `__STR${strings.length - 1}__`;
  });
  
  res = res
    .replace(/\b(const|let|var|function|async|await|return|new|if|else|for|while)\b/g, '<span class="text-pink-600 dark:text-pink-400 font-semibold">$1</span>')
    .replace(/\b(fetch|FormData|JSON|console|document|window)\b/g, '<span class="text-sky-600 dark:text-sky-400 font-semibold">$1</span>')
    .replace(/\b(then|catch|stringify|append|log)\b/g, '<span class="text-amber-600 dark:text-amber-300">$1</span>')
    .replace(/(\/\/.*)/g, '<span class="text-slate-400 dark:text-slate-500 italic">$1</span>');

  strings.forEach((str, i) => {
    res = res.replace(`__STR${i}__`, `<span class="text-emerald-600 dark:text-emerald-400">${str}</span>`);
  });
  return res;
}

function highlightBash(code: string) {
  let res = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let strings: string[] = [];
  res = res.replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, (match) => {
    strings.push(match);
    return `__STR${strings.length - 1}__`;
  });

  res = res
    .replace(/^(curl)\b/g, '<span class="text-pink-600 dark:text-pink-400 font-bold">$1</span>')
    .replace(/\s(-X|-H|-d|-F)\b/g, '<span class="text-sky-600 dark:text-sky-400 font-semibold"> $1</span>')
    .replace(/\\$/gm, '<span class="text-slate-400 dark:text-slate-500">\\</span>');

  strings.forEach((str, i) => {
    res = res.replace(`__STR${i}__`, `<span class="text-emerald-600 dark:text-emerald-400">${str}</span>`);
  });
  return res;
}
