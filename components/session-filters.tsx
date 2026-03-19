"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import type { SessionFilters as Filters } from "@/lib/types";
import type { RankingType } from "@/lib/ranking/ranking-factory";

interface SessionFiltersProps {
  onFilterChange: (filters: Filters, rankingType?: RankingType) => void;
}

export function SessionFilters({ onFilterChange }: SessionFiltersProps) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [maxDistance, setMaxDistance] = useState("10");
  const [rankingType, setRankingType] = useState<RankingType>("relevance");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleApplyFilters = () => {
    const filters: Filters = {};

    if (subject) filters.subject = subject;
    if (category) filters.category = category;
    if (date) filters.date = new Date(date);
    if (maxDistance) filters.maxDistance = Number.parseFloat(maxDistance);

    onFilterChange(filters, rankingType);
  };

  const handleReset = () => {
    setSubject("");
    setCategory("");
    setDate("");
    setMaxDistance("10");
    setRankingType("relevance");
    onFilterChange({}, "relevance");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          Filters
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="hover:bg-primary/10 transition-all hover:scale-105 active:scale-95"
        >
          {showAdvanced ? "Hide" : "Show"} Advanced
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 group">
          <Label htmlFor="subject-filter" className="text-sm font-medium group-hover:text-primary transition-colors">Title / topic</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
            <Input
              id="subject-filter"
              placeholder="Search by title or topic..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="pl-9 transition-all focus:ring-2 focus:ring-primary/20 hover:border-primary/40"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 group">
          <Label className="text-sm font-medium group-hover:text-primary transition-colors">
            Category
          </Label>
          <Select value={category || "all"} onValueChange={(v) => setCategory(v === "all" ? "" : v)}>
            <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20 hover:border-primary/40">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="general">General / social</SelectItem>
              <SelectItem value="sports">Sports & outdoor</SelectItem>
              <SelectItem value="music">Music & arts</SelectItem>
              <SelectItem value="education">Education & skills</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2 group">
          <Label htmlFor="date-filter" className="text-sm font-medium group-hover:text-primary transition-colors">Date</Label>
          <Input
            id="date-filter"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="transition-all focus:ring-2 focus:ring-primary/20 hover:border-primary/40"
          />
        </div>

        <div 
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            showAdvanced ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-2 group">
              <Label htmlFor="distance-filter" className="text-sm font-medium group-hover:text-primary transition-colors">Max Distance (km)</Label>
              <Input
                id="distance-filter"
                type="number"
                min="1"
                max="50"
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
                className="transition-all focus:ring-2 focus:ring-primary/20 hover:border-primary/40"
              />
            </div>

            <div className="flex flex-col gap-2 group">
              <Label htmlFor="ranking-filter" className="text-sm font-medium group-hover:text-primary transition-colors">Sort By</Label>
              <Select
                value={rankingType}
                onValueChange={(value) => setRankingType(value as RankingType)}
              >
                <SelectTrigger id="ranking-filter" className="transition-all focus:ring-2 focus:ring-primary/20 hover:border-primary/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="time">Soonest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <Button 
            onClick={handleApplyFilters} 
            className="flex-1 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            Apply Filters
          </Button>
          <Button 
            onClick={handleReset} 
            variant="outline"
            className="transition-all hover:bg-primary/5 hover:border-primary/40"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
