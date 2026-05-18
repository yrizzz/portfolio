"use client";

import { useState, useEffect } from "react";
import { PortfolioLayout } from "@/components/portfolio-layout";
import { GlowCard } from "@/components/ui/glow-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Activity, Lock, Unlock, Server, Code, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { FadeInOnScroll } from "@/components/scroll-animations";
import { useRouter } from "next/navigation";

export default function ApisPage() {
  const [apis, setApis] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [method, setMethod] = useState("all");
  const router = useRouter();
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchApis = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "9",
        ...(category !== "all" && { category }),
        ...(method !== "all" && { method }),
        ...(search && { search })
      });
      
      const res = await fetch(`/api/public/endpoints?${params}`);
      const data = await res.json();
      
      if (data.endpoints) {
        setApis(data.endpoints);
        setCategories(data.categories || []);
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.total);
      }
    } catch (err) {
      console.error("Failed to fetch APIs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchApis();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, category, method, search]);

  const methodColors: Record<string, string> = {
    GET: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    POST: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    PUT: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    DELETE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    PATCH: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  };

  return (
    <PortfolioLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        <FadeInOnScroll>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#0d47c4] via-[#136bfe] to-[#3b82f6] bg-clip-text text-transparent">
              Public API Directory
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Explore available APIs integrated into this platform. Monitor traffic, discover endpoints, and connect to our reliable backend services.
            </p>
          </div>
        </FadeInOnScroll>

        {/* Filters Section */}
        <FadeInOnScroll delay={0.1} className="relative z-50">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-background/50 backdrop-blur-sm p-4 rounded-xl border">
            <div className="md:col-span-5 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search APIs..." 
                className="pl-9 bg-background/50"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            
            <div className="md:col-span-3">
              <Select value={category} onValueChange={(val) => { setCategory(val); setPage(1); }}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-3">
              <Select value={method} onValueChange={(val) => { setMethod(val); setPage(1); }}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-1 flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => { setSearch(""); setCategory("all"); setMethod("all"); setPage(1); }}
                className="w-full md:w-auto"
              >
                Reset
              </Button>
            </div>
          </div>
        </FadeInOnScroll>

        {/* API Grid */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : apis.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apis.map((api, idx) => (
                <FadeInOnScroll key={api.id} delay={0.1 + (idx * 0.05)}>
                  <GlowCard 
                    className="h-full flex flex-col p-6 space-y-4 hover:shadow-lg transition-all border border-border/50 bg-background/40 backdrop-blur-sm cursor-pointer group"
                    onClick={() => router.push(`/apis/${api.id}`)}
                  >
                    
                    <div className="flex justify-between items-start gap-2">
                      <Badge className={methodColors[api.method] || "bg-secondary"}>
                        {api.method}
                      </Badge>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
                        <Activity className="h-3 w-3 text-green-500" />
                        {api.traffic.toLocaleString()} requests
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors" title={api.name}>
                        {api.name}
                      </h3>
                      <p className="text-sm font-mono text-muted-foreground mt-1 bg-muted/30 p-1.5 rounded truncate" title={api.path}>
                        {api.path}
                      </p>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                      {api.description || "No description provided."}
                    </p>

                    <div className="pt-4 border-t border-border/50 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        {api.requiresAuth ? (
                          <Badge variant="outline" className="text-orange-500 border-orange-500/30 gap-1.5">
                            <Lock className="h-3 w-3" /> Auth
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-500 border-green-500/30 gap-1.5">
                            <Unlock className="h-3 w-3" /> Public
                          </Badge>
                        )}
                        {api.category && (
                          <Badge variant="secondary" className="capitalize">
                            {api.category}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Server className="h-3 w-3" />
                          {api.rateLimit}/min
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </GlowCard>
                </FadeInOnScroll>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-background/30 rounded-xl border border-dashed">
              <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No APIs found</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-6">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              Showing {(page - 1) * 9 + 1} to {Math.min(page * 9, totalItems)} of {totalItems} APIs
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <div className="flex items-center gap-1 px-2">
                <span className="text-sm font-medium">{page}</span>
                <span className="text-sm text-muted-foreground">/ {totalPages}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

      </div>
    </PortfolioLayout>
  );
}
