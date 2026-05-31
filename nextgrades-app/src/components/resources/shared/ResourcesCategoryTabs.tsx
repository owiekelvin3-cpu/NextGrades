"use client";



import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import { RESOURCE_TABS, type ResourceTabId } from "@/lib/resources/ui-config";



type Props = {

  active: ResourceTabId;

  onChange: (tab: ResourceTabId) => void;

  className?: string;

};



export function ResourcesCategoryTabs({ active, onChange, className }: Props) {

  const { t } = useTranslation();



  return (

    <div className={cn("border-b border-border-default bg-surface-elevated", className)}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex gap-1 overflow-x-auto scrollbar-hide py-1">

          {RESOURCE_TABS.map((tab, index) => {

            const label = t(tab.labelKey, {

              defaultValue: [

                "All resources",

                "Learning materials",

                "Worksheets",

                "Explainer videos",

                "Guides & e-books",

                "Exam preparation",

                "Mini courses",

                "Formula collections",

              ][index],

            });

            const isActive = active === tab.id;

            return (

              <button

                key={tab.id}

                type="button"

                onClick={() => onChange(tab.id)}

                className={cn(

                  "shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",

                  isActive

                    ? "border-foreground text-foreground"

                    : "border-transparent text-text-muted hover:text-foreground"

                )}

              >

                {label}

              </button>

            );

          })}

        </div>

      </div>

    </div>

  );

}

