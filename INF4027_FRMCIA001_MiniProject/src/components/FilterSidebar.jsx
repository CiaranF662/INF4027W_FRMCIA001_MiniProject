import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";

const FILTERS = {
    Category: ["Jeans", "Jackets", "Shorts", "Skirts", "Overalls", "Shirts", "Accessories"],
    Brand: ["Levi's", "Wrangler", "Lee", "Diesel", "G-Star RAW", "Guess", "Mr Price", "Woolworths", "Cotton On"],
    Size: ["24", "26", "28", "30", "32", "34", "36", "38", "40"],
    Fit: ["Skinny", "Slim", "Straight", "Relaxed", "Bootcut", "Wide Leg", "Mom", "Boyfriend", "Flare", "Baggy"],
    Rise: ["Low Rise", "Mid Rise", "High Rise"],
    Wash: ["Raw", "Dark", "Medium", "Light", "Acid", "Distressed", "Stone Wash"],
    Condition: ["New with Tags", "Like New", "Good", "Fair"],
    Gender: ["Men", "Women", "Unisex"],
    Stretch: ["No Stretch", "Slight Stretch", "Stretch", "Super Stretch"]
};



export default function FilterSidebar({ activeFilters, toggleFilter, clearFilters, minPrice, setMinPrice, maxPrice, setMaxPrice }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">Filters</h2>
                {(activeFilters.length > 0 || minPrice || maxPrice) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-indigo-600 hover:text-indigo-700 h-8 px-2 text-xs font-medium"
                    >
                        Clear all
                    </Button>
                )}
            </div>

            {/* Price Input Group */}
            <div className="border-b border-slate-100 pb-5 space-y-3">
                <h3 className="text-sm font-medium text-slate-900">Price Range</h3>
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">R</span>
                        <Input
                            type="number"
                            placeholder="Min"
                            className="pl-7 h-9 text-sm focus-visible:ring-indigo-600"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                        />
                    </div>
                    <span className="text-slate-400">-</span>
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">R</span>
                        <Input
                            type="number"
                            placeholder="Max"
                            className="pl-7 h-9 text-sm focus-visible:ring-indigo-600"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Render all custom Collapsible Filters */}
            <Accordion type="multiple" defaultValue={["Category", "Brand", "Condition"]} className="w-full">
                {Object.entries(FILTERS).map(([group, options]) => (
                    <AccordionItem value={group} key={group} className="border-slate-100">
                        <AccordionTrigger className="text-sm font-medium text-slate-900 hover:text-indigo-600 hover:no-underline py-3">
                            {group}
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2.5 pt-1 pb-2">
                                {options.map((option) => {
                                    const isActive = activeFilters.some(f => f.group === group && f.value === option);
                                    return (
                                        <div key={option} className="flex items-center space-x-3">
                                            <Checkbox
                                                id={`${group}-${option}`}
                                                checked={isActive}
                                                onCheckedChange={() => toggleFilter(group, option)}
                                                className="border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 rounded-sm"
                                            />
                                            <label
                                                htmlFor={`${group}-${option}`}
                                                className="text-sm leading-none font-normal text-slate-600 cursor-pointer hover:text-slate-900"
                                            >
                                                {option}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
