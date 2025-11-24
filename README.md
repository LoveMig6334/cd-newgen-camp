# 🏫 CD Smart Campus

**แพลตฟอร์มระบบบริการนักเรียนออนไลน์**

CD Smart Campus is a comprehensive online student services platform designed specifically for educational institutions. Built with modern web technologies, it provides students with easy access to essential campus services, learning resources, and administrative tools.

## 🎯 **Project Purpose**

CD Smart Campus aims to digitize and streamline the student experience by providing:
- **Digital Campus Services**: Room booking, sports management, and student applications
- **Educational Resources**: Interactive learning modules for key subjects
- **Sports Management System**: Real-time sports event tracking and medal tallying
- **Student Portfolio**: Showcase of university and faculty achievements

## ✨ **Main Features**

### 🏠 **Home Portal**
- Modern, responsive landing page with smooth animations
- Quick access to all platform services
- Mobile-first design with optimized user experience

### 📚 **Learning Topics**
- **HTML/CSS Module**: Interactive tutorials and examples
- **JavaScript Course**: Comprehensive programming lessons
- **Design Thinking**: Creative problem-solving methodologies  
- **Figma Training**: UI/UX design tool tutorials

### 🏆 **Sports Management System**
- **Live Medal Dashboard**: Real-time tracking of sports day results
- **Team Scoring**: Color-based team competition system (Green, Pink, Purple, Orange)
- **Event Calendar**: Integration with Google Calendar for sports events
- **Admin Panel**: Event management and score updating

### 🎓 **Student Services**
- **Room Booking**: Meeting and music room reservations
- **Application System**: Student application processing
- **Portfolio Showcase**: University and faculty achievements display

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
- **MySQL2** - Database connectivity
- **Google APIs** - Calendar integration
- **Next.js API Routes** - Serverless backend functions

### **Development Tools**
- **Docker** - Containerization (development & production)
- **Turbopack** - Fast development builds
- **ESLint** - Code quality and consistency

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ installed
- MySQL database setup
- Google Calendar API credentials (for sports calendar features)

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

3. **Environment Setup**
Create a `.env.local` file in the root directory:
```env
MYSQL_URI=mysql://username:password@host:port/database
GOOGLE_CALENDAR_API_KEY=your_google_api_key
```

4. **Database Setup**
Ensure your MySQL database has the required tables:
- `sportsday` - Sports events and results
- `universities` - University information
- `faculties` - Faculty data
- `students` - Student profiles

5. **Run Development Server**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### **Docker Development**
```bash
# Development environment
docker-compose -f docker-compose.development.yaml up

# Production environment  
docker-compose -f docker-compose.production.yaml up
```

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

### **Docker Production**
```bash
docker-compose -f docker-compose.production.yaml up -d
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
- ✅ **Sports System**: Complete with real-time updates
- ✅ **Learning Modules**: Interactive content delivery
- 🔄 **Portfolio System**: Active development
- 📋 **Mobile App**: Future roadmap

## 📄 **License**

This project is part of the CD Smart Campus initiative. All rights reserved.

## 🙋‍♂️ **Support**

For questions, issues, or contributions:
- **Repository**: [GitHub Issues](https://github.com/Theerat22/cdsc/issues)
- **Documentation**: Check the code comments and TypeScript definitions
- **Community**: Join our development discussions

---

**Built with ❤️ for the CD Smart Campus community**
