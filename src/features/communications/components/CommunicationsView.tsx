"use client";

import { AnnouncementsPanel } from "@/features/communications/components/AnnouncementsPanel";
import { TemplatesPanel } from "@/features/communications/components/TemplatesPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CommunicationsView() {
  return <Tabs defaultValue="templates" className="flex flex-col gap-4">
    <TabsList><TabsTrigger value="templates">WhatsApp Templates</TabsTrigger><TabsTrigger value="announcements">Announcements</TabsTrigger></TabsList>
    <TabsContent value="templates"><TemplatesPanel /></TabsContent>
    <TabsContent value="announcements"><AnnouncementsPanel /></TabsContent>
  </Tabs>;
}
