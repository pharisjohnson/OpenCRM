"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Company, Contact, Deal, Activity, Project, Task, SecureCredential, ChatMessage, CalendarEvent, Notification, Ticket, FinanceDocument } from '../types';
import { MOCK_COMPANIES, MOCK_CONTACTS, MOCK_DEALS, MOCK_ACTIVITIES, MOCK_PROJECTS, MOCK_TASKS, MOCK_CREDENTIALS, MOCK_MESSAGES, MOCK_EVENTS, MOCK_NOTIFICATIONS, MOCK_TICKETS, MOCK_FINANCE } from '../constants';

interface DataContextType {
    // Data Entities
    companies: Company[];
    contacts: Contact[];
    deals: Deal[];
    activities: Activity[];
    projects: Project[];
    tasks: Task[];
    credentials: SecureCredential[];
    messages: ChatMessage[];
    events: CalendarEvent[];
    notifications: Notification[];
    tickets: Ticket[];
    financeDocs: FinanceDocument[];

    // Actions
    addCompany: (company: Company) => void;
    addContact: (contact: Contact) => void;
    addDeal: (deal: Deal) => void;
    // ... (Can expand actions as needed for full CRUD)

    // Data Management
    loadMockData: () => void;
    clearData: () => void;
    isLoaded: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    // State for all entities
    const [companies, setCompanies] = useState<Company[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [credentials, setCredentials] = useState<SecureCredential[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [financeDocs, setFinanceDocs] = useState<FinanceDocument[]>([]);

    useEffect(() => {
        // initializeData
        const savedData = localStorage.getItem('opencrm_data');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setCompanies(parsed.companies || []);
                setContacts(parsed.contacts || []);
                setDeals(parsed.deals || []);
                setActivities(parsed.activities || []);
                setProjects(parsed.projects || []);
                setTasks(parsed.tasks || []);
                setCredentials(parsed.credentials || []);
                setMessages(parsed.messages || []);
                setEvents(parsed.events || []);
                setNotifications(parsed.notifications || []);
                setTickets(parsed.tickets || []);
                setFinanceDocs(parsed.financeDocs || []);
            } catch (e) {
                console.error("Failed to load data", e);
            }
        } else {
            // CLEAN SLATE DEFAULT: Do NOT load MOCK_DATA automatically for new users.
            // We start empty.

            // OPTIONAL: If we want to force some 'system' notifications or events, we could do it here.
        }
        setIsLoaded(true);
    }, []);

    // Persistence Hook
    useEffect(() => {
        if (!isLoaded) return;
        const dataToSave = {
            companies,
            contacts,
            deals,
            activities,
            projects,
            tasks,
            credentials,
            messages,
            events,
            notifications,
            tickets,
            financeDocs
        };
        localStorage.setItem('opencrm_data', JSON.stringify(dataToSave));
    }, [companies, contacts, deals, activities, projects, tasks, credentials, messages, events, notifications, tickets, financeDocs, isLoaded]);

    const loadMockData = () => {
        setCompanies(MOCK_COMPANIES);
        setContacts(MOCK_CONTACTS);
        setDeals(MOCK_DEALS);
        setActivities(MOCK_ACTIVITIES);
        setProjects(MOCK_PROJECTS);
        setTasks(MOCK_TASKS);
        setCredentials(MOCK_CREDENTIALS);
        setMessages(MOCK_MESSAGES);
        setEvents(MOCK_EVENTS);
        setNotifications(MOCK_NOTIFICATIONS);
        setTickets(MOCK_TICKETS);
        setFinanceDocs(MOCK_FINANCE);
    };

    const clearData = () => {
        setCompanies([]);
        setContacts([]);
        setDeals([]);
        setActivities([]);
        setProjects([]);
        setTasks([]);
        setCredentials([]);
        setMessages([]);
        setEvents([]);
        setNotifications([]);
        setTickets([]);
        setFinanceDocs([]);
    };

    const addCompany = (item: Company) => setCompanies([...companies, item]);
    const addContact = (item: Contact) => setContacts([...contacts, item]);
    const addDeal = (item: Deal) => setDeals([...deals, item]);

    return (
        <DataContext.Provider value={{
            companies, contacts, deals, activities, projects, tasks, credentials, messages, events, notifications, tickets, financeDocs,
            addCompany, addContact, addDeal,
            loadMockData, clearData, isLoaded
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
