<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CRM - Contact Details</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        .contact-avatar {
            width: 120px;
            height: 120px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .tab-active {
            border-bottom: 3px solid #667eea;
            color: #667eea;
            font-weight: 600;
        }
        .activity-item:not(:last-child) {
            border-bottom: 1px solid #e2e8f0;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e0;
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #a0aec0;
        }
    </style>
</head>
<body class="bg-gray-50 font-sans">
    <div class="p-6">

            <!-- Contact detail content -->
            <main class="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
                <div class="max-w-6xl mx-auto">
                    <!-- Back button and actions -->
                    <div class="flex items-center justify-between mb-6">
                        <a href="#" class="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800">
                            <i class="fas fa-arrow-left mr-2"></i>
                            Back to contacts
                        </a>
                        <div class="flex space-x-3">
                            <button class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                                <i class="fas fa-edit mr-2"></i> Edit
                            </button>
                            <button class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                                <i class="fas fa-plus mr-2"></i> New Task
                            </button>
                        </div>
                    </div>

                    <!-- Contact header -->
                    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div class="p-6 md:p-8">
                            <div class="flex flex-col md:flex-row md:items-center">
                                <div class="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                                    <div class="contact-avatar rounded-full flex items-center justify-center text-white text-4xl font-bold">
                                        JD
                                    </div>
                                </div>
                                <div class="flex-1">
                                    <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <h1 class="text-2xl font-bold text-gray-900">John Doe</h1>
                                            <p class="text-gray-600">CEO at TechCorp</p>
                                        </div>
                                        <div class="mt-4 md:mt-0 flex space-x-2">
                                            <span class="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>
                                            <span class="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">VIP</span>
                                        </div>
                                    </div>
                                    <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div class="flex items-center">
                                            <i class="fas fa-envelope text-gray-400 mr-3"></i>
                                            <span class="text-gray-700">john.doe@example.com</span>
                                        </div>
                                        <div class="flex items-center">
                                            <i class="fas fa-phone text-gray-400 mr-3"></i>
                                            <span class="text-gray-700">(555) 123-4567</span>
                                        </div>
                                        <div class="flex items-center">
                                            <i class="fas fa-map-marker-alt text-gray-400 mr-3"></i>
                                            <span class="text-gray-700">San Francisco, CA</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tabs -->
                        <div class="border-b border-gray-200">
                            <nav class="flex -mb-px">
                                <button onclick="switchTab('overview')" class="tab-active py-4 px-6 text-sm font-medium text-center border-b-2 border-transparent whitespace-nowrap">
                                    Overview
                                </button>
                                <button onclick="switchTab('activity')" class="py-4 px-6 text-sm font-medium text-center text-gray-500 border-b-2 border-transparent whitespace-nowrap hover:text-gray-700 hover:border-gray-300">
                                    Activity
                                </button>
                                <button onclick="switchTab('tasks')" class="py-4 px-6 text-sm font-medium text-center text-gray-500 border-b-2 border-transparent whitespace-nowrap hover:text-gray-700 hover:border-gray-300">
                                    Tasks
                                </button>
                                <button onclick="switchTab('notes')" class="py-4 px-6 text-sm font-medium text-center text-gray-500 border-b-2 border-transparent whitespace-nowrap hover:text-gray-700 hover:border-gray-300">
                                    Notes
                                </button>
                                <button onclick="switchTab('files')" class="py-4 px-6 text-sm font-medium text-center text-gray-500 border-b-2 border-transparent whitespace-nowrap hover:text-gray-700 hover:border-gray-300">
                                    Files
                                </button>
                                <button onclick="switchTab('projects')" class="py-4 px-6 text-sm font-medium text-center text-gray-500 border-b-2 border-transparent whitespace-nowrap hover:text-gray-700 hover:border-gray-300">
                                    Projects
                                </button>
                                <button onclick="switchTab('cases')" class="py-4 px-6 text-sm font-medium text-center text-gray-500 border-b-2 border-transparent whitespace-nowrap hover:text-gray-700 hover:border-gray-300">
                                    Cases
                                </button>
                            </nav>
                        </div>

                        <!-- Tab content -->
                        <div id="overview-tab" class="p-6">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <!-- Left column -->
                                <div class="md:col-span-2 space-y-6">
                                    <!-- About section -->
                                    <div class="bg-white rounded-lg shadow-sm p-6">
                                        <h2 class="text-lg font-medium text-gray-900 mb-4">About</h2>
                                        <p class="text-gray-600 mb-4">John is the CEO of TechCorp, a leading technology company specializing in enterprise software solutions. He has over 15 years of experience in the tech industry.</p>
                                        <div class="grid grid-cols-2 gap-4">
                                            <div>
                                                <h3 class="text-sm font-medium text-gray-500">Company</h3>
                                                <p class="text-gray-900">TechCorp</p>
                                            </div>
                                            <div>
                                                <h3 class="text-sm font-medium text-gray-500">Position</h3>
                                                <p class="text-gray-900">CEO</p>
                                            </div>
                                            <div>
                                                <h3 class="text-sm font-medium text-gray-500">Industry</h3>
                                                <p class="text-gray-900">Technology</p>
                                            </div>
                                            <div>
                                                <h3 class="text-sm font-medium text-gray-500">Source</h3>
                                                <p class="text-gray-900">LinkedIn</p>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Recent activity -->
                                    <div class="bg-white rounded-lg shadow-sm p-6">
                                        <div class="flex items-center justify-between mb-4">
                                            <h2 class="text-lg font-medium text-gray-900">Recent Activity</h2>
                                            <button class="text-sm text-indigo-600 hover:text-indigo-800">View All</button>
                                        </div>
                                        <div class="space-y-4">
                                            <div class="activity-item pb-4">
                                                <div class="flex">
                                                    <div class="flex-shrink-0 mr-3">
                                                        <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                            <i class="fas fa-phone"></i>
                                                        </div>
                                                    </div>
                                                    <div class="flex-1">
                                                        <p class="text-sm font-medium text-gray-900">Phone call</p>
                                                        <p class="text-sm text-gray-500">You had a 25 minute call with John about the new project</p>
                                                        <p class="text-xs text-gray-400 mt-1">2 hours ago</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="activity-item pb-4">
                                                <div class="flex">
                                                    <div class="flex-shrink-0 mr-3">
                                                        <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                            <i class="fas fa-envelope"></i>
                                                        </div>
                                                    </div>
                                                    <div class="flex-1">
                                                        <p class="text-sm font-medium text-gray-900">Email sent</p>
                                                        <p class="text-sm text-gray-500">You sent the proposal documents to John</p>
                                                        <p class="text-xs text-gray-400 mt-1">Yesterday</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Right column -->
                                <div class="space-y-6">
                                    <!-- Contact info -->
                                    <div class="bg-white rounded-lg shadow-sm p-6">
                                        <h2 class="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
                                        <div class="space-y-4">
                                            <div>
                                                <h3 class="text-sm font-medium text-gray-500">Email</h3>
                                                <p class="text-gray-900">john.doe@example.com</p>
                                            </div>
                                            <div>
                                                <h3 class="text-sm font-medium text-gray-500">Phone</h3>
                                                <p class="text-gray-900">(555) 123-4567</p>
                                            </div>
                                            <div>
                                                <h3 class="text-sm font-medium text-gray-500">Mobile</h3>
                                                <p class="text-gray-900">(555) 987-6543</p>
                                            </div>
                                            <div>
                                                <h3 class="text-sm font-medium text-gray-500">Address</h3>
                                                <p class="text-gray-900">123 Tech Street<br>San Francisco, CA 94107</p>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Social media -->
                                    <div class="bg-white rounded-lg shadow-sm p-6">
                                        <h2 class="text-lg font-medium text-gray-900 mb-4">Social Media</h2>
                                        <div class="space-y-3">
                                            <div class="flex items-center">
                                                <i class="fab fa-linkedin text-blue-600 mr-3"></i>
                                                <a href="#" class="text-indigo-600 hover:text-indigo-800">linkedin.com/in/johndoe</a>
                                            </div>
                                            <div class="flex items-center">
                                                <i class="fab fa-twitter text-blue-400 mr-3"></i>
                                                <a href="#" class="text-indigo-600 hover:text-indigo-800">twitter.com/johndoe</a>
                                            </div>
                                            <div class="flex items-center">
                                                <i class="fab fa-facebook text-blue-700 mr-3"></i>
                                                <a href="#" class="text-indigo-600 hover:text-indigo-800">facebook.com/johndoe</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Activity tab (hidden by default) -->
                        <div id="activity-tab" class="hidden p-6">
                            <div class="bg-white rounded-lg shadow-sm p-6">
                                <h2 class="text-lg font-medium text-gray-900 mb-6">All Activity</h2>
                                <div class="space-y-6">
                                    <div class="activity-item pb-6">
                                        <div class="flex">
                                            <div class="flex-shrink-0 mr-4">
                                                <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                    <i class="fas fa-phone"></i>
                                                </div>
                                            </div>
                                            <div class="flex-1">
                                                <div class="flex items-center justify-between">
                                                    <p class="text-sm font-medium text-gray-900">Phone call</p>
                                                    <p class="text-xs text-gray-400">2 hours ago</p>
                                                </div>
                                                <p class="text-sm text-gray-500 mt-1">You had a 25 minute call with John about the new project</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="activity-item pb-6">
                                        <div class="flex">
                                            <div class="flex-shrink-0 mr-4">
                                                <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                    <i class="fas fa-envelope"></i>
                                                </div>
                                            </div>
                                            <div class="flex-1">
                                                <div class="flex items-center justify-between">
                                                    <p class="text-sm font-medium text-gray-900">Email sent</p>
                                                    <p class="text-xs text-gray-400">Yesterday</p>
                                                </div>
                                                <p class="text-sm text-gray-500 mt-1">You sent the proposal documents to John</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="activity-item pb-6">
                                        <div class="flex">
                                            <div class="flex-shrink-0 mr-4">
                                                <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                                    <i class="fas fa-calendar"></i>
                                                </div>
                                            </div>
                                            <div class="flex-1">
                                                <div class="flex items-center justify-between">
                                                    <p class="text-sm font-medium text-gray-900">Meeting scheduled</p>
                                                    <p class="text-xs text-gray-400">3 days ago</p>
                                                </div>
                                                <p class="text-sm text-gray-500 mt-1">Scheduled a follow-up meeting for next week</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tasks tab (hidden by default) -->
                        <div id="tasks-tab" class="hidden p-6">
                            <div class="bg-white rounded-lg shadow-sm p-6">
                                <div class="flex items-center justify-between mb-6">
                                    <h2 class="text-lg font-medium text-gray-900">Tasks</h2>
                                    <button class="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                                        <i class="fas fa-plus mr-1"></i> Add Task
                                    </button>
                                </div>
                                <div class="space-y-4">
                                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                        <div class="flex items-center">
                                            <input type="checkbox" class="h-4 w-4 text-indigo-600 rounded">
                                            <span class="ml-3 text-sm font-medium text-gray-900">Follow up on proposal</span>
                                        </div>
                                        <span class="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                                    </div>
                                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                        <div class="flex items-center">
                                            <input type="checkbox" class="h-4 w-4 text-indigo-600 rounded" checked>
                                            <span class="ml-3 text-sm font-medium text-gray-900 line-through">Schedule meeting</span>
                                        </div>
                                        <span class="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">Completed</span>
                                    </div>
                                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                        <div class="flex items-center">
                                            <input type="checkbox" class="h-4 w-4 text-indigo-600 rounded">
                                            <span class="ml-3 text-sm font-medium text-gray-900">Send contract</span>
                                        </div>
                                        <span class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">In Progress</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Notes tab (hidden by default) -->
                        <div id="notes-tab" class="hidden p-6">
                            <div class="bg-white rounded-lg shadow-sm p-6">
                                <div class="flex items-center justify-between mb-6">
                                    <h2 class="text-lg font-medium text-gray-900">Notes</h2>
                                    <button class="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                                        <i class="fas fa-plus mr-1"></i> Add Note
                                    </button>
                                </div>
                                <div class="space-y-6">
                                    <div class="p-4 bg-gray-50 rounded-md">
                                        <div class="flex items-center justify-between mb-2">
                                            <span class="text-sm font-medium text-gray-900">Sarah Johnson</span>
                                            <span class="text-xs text-gray-400">2 days ago</span>
                                        </div>
                                        <p class="text-sm text-gray-600">John mentioned he's interested in our premium package. We should follow up next week with more details.</p>
                                    </div>
                                    <div class="p-4 bg-gray-50 rounded-md">
                                        <div class="flex items-center justify-between mb-2">
                                            <span class="text-sm font-medium text-gray-900">Michael Smith</span>
                                            <span class="text-xs text-gray-400">1 week ago</span>
                                        </div>
                                        <p class="text-sm text-gray-600">Important client - VIP status. Prefers email communication over phone calls.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Files tab (hidden by default) -->
                        <div id="files-tab" class="hidden p-6">
                            <div class="bg-white rounded-lg shadow-sm p-6">
                                <div class="flex items-center justify-between mb-6">
                                    <h2 class="text-lg font-medium text-gray-900">Files</h2>
                                    <button class="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                                        <i class="fas fa-upload mr-1"></i> Upload
                                    </button>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div class="p-4 border border-gray-200 rounded-md hover:bg-gray-50">
                                        <div class="flex items-center">
                                            <div class="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center text-blue-600">
                                                <i class="fas fa-file-pdf"></i>
                                            </div>
                                            <div class="ml-4">
                                                <p class="text-sm font-medium text-gray-900 truncate">Proposal.pdf</p>
                                                <p class="text-xs text-gray-500">2.4 MB • 3 days ago</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="p-4 border border-gray-200 rounded-md hover:bg-gray-50">
                                        <div class="flex items-center">
                                            <div class="flex-shrink-0 w-10 h-10 bg-green-100 rounded-md flex items-center justify-center text-green-600">
                                                <i class="fas fa-file-word"></i>
                                            </div>
                                            <div class="ml-4">
                                                <p class="text-sm font-medium text-gray-900 truncate">Contract.docx</p>
                                                <p class="text-xs text-gray-500">1.8 MB • 1 week ago</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="p-4 border border-gray-200 rounded-md hover:bg-gray-50">
                                        <div class="flex items-center">
                                            <div class="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-md flex items-center justify-center text-yellow-600">
                                                <i class="fas fa-file-excel"></i>
                                            </div>
                                            <div class="ml-4">
                                                <p class="text-sm font-medium text-gray-900 truncate">Pricing.xlsx</p>
                                                <p class="text-xs text-gray-500">3.2 MB • 2 weeks ago</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Projects tab (hidden by default) -->
                        <div id="projects-tab" class="hidden p-6">
                            <div class="bg-white rounded-lg shadow-sm p-6">
                                <div class="flex items-center justify-between mb-6">
                                    <h2 class="text-lg font-medium text-gray-900">Projects</h2>
                                    <button class="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                                        <i class="fas fa-plus mr-1"></i> Add Project
                                    </button>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                        <div class="p-4 bg-indigo-50">
                                            <h3 class="font-medium text-indigo-700">TechCorp Website Redesign</h3>
                                            <p class="text-sm text-gray-600 mt-1">Due: Jun 15, 2023</p>
                                        </div>
                                        <div class="p-4">
                                            <p class="text-sm text-gray-600">Complete redesign of corporate website with new CMS integration</p>
                                            <div class="flex items-center mt-4 text-sm text-gray-500">
                                                <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Active</span>
                                                <span class="ml-auto">$25,000</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                        <div class="p-4 bg-blue-50">
                                            <h3 class="font-medium text-blue-700">Mobile App Development</h3>
                                            <p class="text-sm text-gray-600 mt-1">Due: Aug 30, 2023</p>
                                        </div>
                                        <div class="p-4">
                                            <p class="text-sm text-gray-600">Cross-platform mobile application for customer portal</p>
                                            <div class="flex items-center mt-4 text-sm text-gray-500">
                                                <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Planning</span>
                                                <span class="ml-auto">$42,000</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Cases tab (hidden by default) -->
                        <div id="cases-tab" class="hidden p-6">
                            <div class="bg-white rounded-lg shadow-sm p-6">
                                <div class="flex items-center justify-between mb-6">
                                    <h2 class="text-lg font-medium text-gray-900">Support Cases</h2>
                                    <button class="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                                        <i class="fas fa-plus mr-1"></i> New Case
                                    </button>
                                </div>
                                <div class="overflow-x-auto">
                                    <table class="min-w-full divide-y divide-gray-200">
                                        <thead class="bg-gray-50">
                                            <tr>
                                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case #</th>
                                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                                            </tr>
                                        </thead>
                                        <tbody class="bg-white divide-y divide-gray-200">
                                            <tr>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">CS-1245</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Login issues after update</td>
                                                <td class="px-6 py-4 whitespace-nowrap">
                                                    <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Resolved</span>
                                                </td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">High</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2 days ago</td>
                                            </tr>
                                            <tr>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">CS-1189</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Reporting module error</td>
                                                <td class="px-6 py-4 whitespace-nowrap">
                                                    <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">In Progress</span>
                                                </td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Medium</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1 week ago</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <script>
        // Tab switching functionality
        function switchTab(tabName) {
            // Hide all tab contents
            document.getElementById('overview-tab').classList.add('hidden');
            document.getElementById('activity-tab').classList.add('hidden');
            document.getElementById('tasks-tab').classList.add('hidden');
            document.getElementById('notes-tab').classList.add('hidden');
            document.getElementById('files-tab').classList.add('hidden');
            document.getElementById('projects-tab').classList.add('hidden');
            document.getElementById('cases-tab').classList.add('hidden');
            
            // Remove active class from all tab buttons
            const tabButtons = document.querySelectorAll('nav button');
            tabButtons.forEach(button => {
                button.classList.remove('tab-active');
                button.classList.add('text-gray-500');
            });
            
            // Show selected tab content
            document.getElementById(`${tabName}-tab`).classList.remove('hidden');
            
            // Add active class to selected tab button
            const activeButton = Array.from(tabButtons).find(button => 
                button.textContent.trim().toLowerCase() === tabName
            );
            if (activeButton) {
                activeButton.classList.add('tab-active');
                activeButton.classList.remove('text-gray-500');
            }
        }

        // Mobile menu toggle (placeholder)
        document.querySelector('.md\\:hidden button').addEventListener('click', function() {
            alert('Mobile menu would open here');
        });

        // User menu toggle (placeholder)
        document.getElementById('user-menu-button').addEventListener('click', function() {
            alert('User dropdown would open here');
        });
    </script>
</body>
</html>