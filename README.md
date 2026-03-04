# 🏫 CD NEXT GEN WEB ACADEMY

**แพลตฟอร์มระบบบริการนักเรียนออนไลน์**

CD NEXT GEN WEB ACADEMY is a comprehensive online web application development learning platform designed specifically for educational institutions. Built with modern web technologies.

## 🎯 **Project Purpose**

CD NEXT GEN WEB ACADEMY aims to digitize and streamline the student experience by providing:
- **Digital Campus Services**: Room booking, sports management, and student applications
- **Educational Resources**: Interactive learning modules for key subjects

## ✨ **Main Features**

### 📚 **Learning Topics**
- **HTML/CSS Module**: Interactive tutorials and examples
- **JavaScript Course**: Comprehensive programming lessons
- **Design Thinking**: Creative problem-solving methodologies  
- **Figma Training**: UI/UX design tool tutorials

## 🛠 **Technology Stack**

### **Frontend**
- **Next.js 15.2.3** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Modern utility-first styling
- **Framer Motion** - Smooth animations and transitions

### **UI/UX Libraries**
- **Material-UI (@mui/material)** - Component library
- **Heroicons & Lucide React** - Icon systems
- **React Icons** - Additional icon collections

### **Backend & Database**
- **Next.js API Routes** - Serverless backend functions

### **Development Tools**
- **Turbopack** - Fast development builds
- **ESLint** - Code quality and consistency

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ installed

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/Theerat22/cdsc.git
cd cdsc
```

2. **Install dependencies**
```bash
npm install
```

3. **Run Development Server**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.


## 📁 **Project Structure**

```
cdsc/
├── app/                          # Next.js App Router
│   ├── components/              # Reusable UI components
│   │   ├── UI/                  # Base UI components
│   │   ├── NavBar.tsx           # Main navigation
│   │   └── SportTable.tsx       # Sports dashboard
│   ├── home/                    # Landing page
│   │   └── sections/            # Page sections
│   ├── topics/                  # Educational modules
│   ├── application/             # Student applications
│   └── api/                     # Backend API routes
├── utils/                       # Utility functions
├── public/                      # Static assets
│   └── Fonts/                   # Custom Thai fonts
└── docker-compose.*.yaml       # Container configurations
```

## 🎨 **Design System**

### **Color Palette**
- **Primary Blue**: Modern, professional campus branding
- **Team Colors**: Green, Pink, Purple, Orange for sports system
- **Gradients**: Smooth color transitions throughout UI

### **Typography**
- **Sukhumvit Set**: Custom Thai font family (6 weights)
- **Geist Sans**: Modern English font for optimal readability

### **Component Philosophy**
- **Mobile-first responsive design**
- **Consistent spacing and typography scale**
- **Accessible color contrasts and interactions**

## 🔧 **Development Workflow**

### **Available Scripts**
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint checks
npm run production   # Build and start production
```

### **Code Organization**
- **Components**: Modular, reusable React components
- **API Routes**: RESTful endpoints using Next.js API routes
- **Styling**: Utility-first Tailwind CSS with custom components
- **Type Safety**: Full TypeScript integration

## 🌐 **Deployment**

### **Production Build**
```bash
npm run build
npm run start
```


### **Environment Variables**
Ensure all production environment variables are properly configured:
- Database connection strings
- API keys and secrets  
- External service credentials

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📊 **Project Status**

- ✅ **Core Platform**: Fully functional
- ✅ **Learning Modules**: Interactive content delivery


## 📄 **License**

This project is part of the CD Smart Campus initiative. All rights reserved.

## 🙋‍♂️ **Support**

For questions, issues, or contributions:
- **Repository**: [GitHub Issues](https://github.com/Theerat22/cdsc/issues)
- **Documentation**: Check the code comments and TypeScript definitions
- **Community**: Join our development discussions

---

**Built with ❤️ for the CDS**
