"use client";

import React from "react";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { Tooltip } from "@heroui/tooltip";
import { Icon } from "@iconify/react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

type NavItem = {
  label: string;
  icon: string;
  href: string;
  badge?: number;
};

type NavSection = {
  title?: string;
  items: NavItem[];
};

export const DoctorSidebar = () => {
  const [isOpen, setIsOpen] = React.useState(true);
  const [activeItem, setActiveItem] = React.useState("dashboard");
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/sign-in");
  };

  const navigation: NavSection[] = [
    {
      items: [
        {
          label: "Dashboard",
          icon: "lucide:layout-dashboard",
          href: "/doctor/dashboard",
        },
        { label: "Patients", icon: "lucide:users", href: "/doctor/patients" },
        {
          label: "Appointments",
          icon: "lucide:calendar",
          href: "/doctor/appointments",
          badge: 8,
        },
        { label: "Schedule", icon: "lucide:clock", href: "/doctor/schedule" },
      ],
    },
    {
      title: "Medical",
      items: [
        {
          label: "Medical Records",
          icon: "lucide:file-text",
          href: "/doctor/records",
        },
        {
          label: "Prescriptions",
          icon: "lucide:pill",
          href: "/doctor/prescriptions",
        },
        {
          label: "Lab Results",
          icon: "lucide:flask",
          href: "/doctor/lab-results",
        },
        {
          label: "Diagnosis",
          icon: "lucide:stethoscope",
          href: "/doctor/diagnosis",
        },
      ],
    },
    {
      title: "Tools",
      items: [
        {
          label: "Reports",
          icon: "lucide:file-bar-chart",
          href: "/doctor/reports",
        },
        {
          label: "Consultations",
          icon: "lucide:video",
          href: "/doctor/consultations",
        },
        {
          label: "Settings",
          icon: "lucide:settings",
          href: "/doctor/settings",
        },
        {
          label: "Role Sync",
          icon: "lucide:refresh-cw",
          href: "/admin/role-sync",
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {!isOpen && (
        <div
          className="fixed inset-0 bg-overlay/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen bg-content1 border-r border-divider transition-all duration-300 ease-in-out
          ${isOpen ? "w-64" : "w-16"} 
          lg:relative lg:z-auto lg:h-full
        `}
      >
        {/* Toggle button */}
        <button
          className="absolute -right-3 top-10 bg-primary text-white rounded-full p-1 shadow-md lg:flex hidden"
          onClick={toggleSidebar}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            )}
          </svg>
        </button>

        {/* Mobile toggle */}
        <button
          className="absolute right-4 top-4 lg:hidden"
          onClick={toggleSidebar}
        >
          <svg
            className="w-5 h-5 text-default-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* User profile */}
        <div className={`px-4 py-3 ${!isOpen && "flex justify-center"}`}>
          {isOpen ? (
            <div className="flex items-center gap-3 p-2 rounded-md">
              <UserButton
                afterSignOutUrl="/sign-in"
                appearance={{
                  elements: { userButtonAvatarBox: "w-8 h-8" },
                }}
              />
              <div className="flex-1 overflow-hidden">
                <div>Doctor</div>
              </div>
            </div>
          ) : (
            <Tooltip
              content={`${user?.firstName} ${user?.lastName}`}
              placement="right"
            >
              <UserButton
                afterSignOutUrl="/sign-in"
                appearance={{
                  elements: { userButtonAvatarBox: "w-8 h-8" },
                }}
              />
            </Tooltip>
          )}
        </div>

        <Divider className="my-2" />

        {/* Navigation */}
        <div
          className={`py-2 flex flex-col gap-1 overflow-y-auto flex-1 ${isOpen ? "px-3" : "px-2"}`}
        >
          {navigation.map((section, idx) => (
            <div key={idx} className="mb-3">
              {section.title && isOpen && (
                <p className="text-xs font-medium text-default-500 px-3 mb-2 uppercase tracking-wider">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => (
                <NavItem
                  key={item.label}
                  item={item}
                  isActive={activeItem === item.href.split("/").pop()}
                  isCollapsed={!isOpen}
                  onClick={() => {
                    setActiveItem(item.href.split("/").pop() || "dashboard");
                    router.push(item.href);
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`absolute bottom-0 w-full ${isOpen ? "p-4" : "p-2"}`}>
          <Divider className="mb-3" />
          {isOpen && (
            <div className="text-center text-xs text-default-500">
              <p>Clinic Management System</p>
              <p>Powered by Clerk</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

interface NavItemProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  item,
  isActive,
  isCollapsed,
  onClick,
}) => {
  const { label, icon, href, badge } = item;

  const content = (
    <Button
      variant="flat"
      color={isActive ? "primary" : "default"}
      className={`justify-start ${isCollapsed ? "justify-center px-0 h-10 w-10 min-w-10" : "w-full h-9"} mb-1`}
      startContent={!isCollapsed && <NavIcon icon={icon} />}
      onPress={onClick}
    >
      {isCollapsed ? (
        <NavIcon icon={icon} size="md" />
      ) : (
        <div className="flex items-center justify-between w-full">
          <span>{label}</span>
          {badge && (
            <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
      )}
    </Button>
  );

  return isCollapsed ? (
    <Tooltip content={label} placement="right">
      {content}
    </Tooltip>
  ) : (
    content
  );
};

// Component to render navigation icons using Clerk-style icons
const NavIcon: React.FC<{ icon: string; size?: "sm" | "md" }> = ({
  icon,
  size = "md",
}) => {
  // Clerk-style icons (simplified and clean)
  const clerkIconMap: { [key: string]: string } = {
    "lucide:layout-dashboard":
      "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z",
    "lucide:users":
      "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    "lucide:calendar":
      "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    "lucide:clock": "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    "lucide:file-text":
      "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
    "lucide:pill":
      "M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3",
    "lucide:flask":
      "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
    "lucide:stethoscope": "M4.5 12a7.5 7.5 0 0015 0M12 3v9m-3-3l3 3 3-3",
    "lucide:file-bar-chart":
      "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    "lucide:video":
      "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
    "lucide:settings":
      "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    "lucide:refresh-cw":
      "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  };

  const iconPath = clerkIconMap[icon];

  const iconSize = size === "sm" ? "w-4 h-4" : "w-6 h-6";

  if (iconPath) {
    return (
      <svg
        className={iconSize}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        style={{ strokeWidth: 1.5 }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
      </svg>
    );
  }

  // Fallback to iconify if icon not found
  return <Icon icon={icon} className={iconSize} />;
};
