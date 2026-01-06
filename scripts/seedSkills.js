/**
 * Seed Script for Skills Database
 * 
 * This script populates the Firebase Firestore with essential skills
 * for a Fresher Software Engineer position.
 * 
 * To run: node scripts/seedSkills.js
 * Make sure you have set up your Firebase credentials in .env.local
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const essentialSkills = [
  // Programming Languages just for essentials
  {
    name: 'JavaScript',
    category: 'Programming Language',
    skill_url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
    description: 'Essential for web development, both frontend and backend',
    priority: 10
  },
  {
    name: 'Python',
    category: 'Programming Language',
    skill_url: 'https://www.coursera.org/specializations/python',
    description: 'Versatile language for web, data science, and automation',
    priority: 9
  },
  {
    name: 'TypeScript',
    category: 'Programming Language',
    skill_url: 'https://www.udemy.com/course/understanding-typescript/',
    description: 'Typed superset of JavaScript for large-scale applications',
    priority: 8
  },
  {
    name: 'Java',
    category: 'Programming Language',
    skill_url: 'https://www.coursera.org/specializations/java-programming',
    description: 'Enterprise application development',
    priority: 7
  },

  // Frontend Frameworks
  {
    name: 'React',
    category: 'Frontend Framework',
    skill_url: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
    description: 'Popular library for building user interfaces',
    priority: 10
  },
  {
    name: 'Next.js',
    category: 'Frontend Framework',
    skill_url: 'https://www.youtube.com/watch?v=Sklc_fQBmcs',
    description: 'React framework for production',
    priority: 8
  },
  {
    name: 'Vue.js',
    category: 'Frontend Framework',
    skill_url: 'https://www.udemy.com/course/vuejs-2-the-complete-guide/',
    description: 'Progressive JavaScript framework',
    priority: 7
  },

  // Backend Technologies
  {
    name: 'Node.js',
    category: 'Backend',
    skill_url: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
    description: 'JavaScript runtime for server-side development',
    priority: 9
  },
  {
    name: 'Express.js',
    category: 'Backend',
    skill_url: 'https://www.coursera.org/learn/server-side-nodejs',
    description: 'Web application framework for Node.js',
    priority: 8
  },
  {
    name: 'RESTful API',
    category: 'Backend',
    skill_url: 'https://www.udemy.com/course/rest-api-design-development-management/',
    description: 'Design and implementation of REST APIs',
    priority: 9
  },

  // Databases
  {
    name: 'SQL',
    category: 'Database',
    skill_url: 'https://www.coursera.org/learn/intro-sql',
    description: 'Relational database query language',
    priority: 9
  },
  {
    name: 'MongoDB',
    category: 'Database',
    skill_url: 'https://www.mongodb.com/university',
    description: 'NoSQL database for modern applications',
    priority: 8
  },
  {
    name: 'PostgreSQL',
    category: 'Database',
    skill_url: 'https://www.udemy.com/course/the-complete-python-postgresql-developer-course/',
    description: 'Advanced open-source relational database',
    priority: 7
  },

  // Version Control
  {
    name: 'Git',
    category: 'Version Control',
    skill_url: 'https://www.youtube.com/watch?v=RGOj5yH7evk',
    description: 'Distributed version control system',
    priority: 10
  },
  {
    name: 'GitHub',
    category: 'Version Control',
    skill_url: 'https://www.youtube.com/watch?v=nhNq2kIvi9s',
    description: 'Code hosting platform and collaboration',
    priority: 9
  },

  // DevOps & Tools
  {
    name: 'Docker',
    category: 'DevOps',
    skill_url: 'https://www.youtube.com/watch?v=fqMOX6JJhGo',
    description: 'Containerization platform',
    priority: 7
  },
  {
    name: 'CI/CD',
    category: 'DevOps',
    skill_url: 'https://www.coursera.org/learn/continuous-integration',
    description: 'Continuous Integration and Deployment practices',
    priority: 6
  },

  // Web Technologies
  {
    name: 'HTML',
    category: 'Web Technology',
    skill_url: 'https://www.youtube.com/watch?v=pQN-pnXPaVg',
    description: 'Markup language for web pages',
    priority: 10
  },
  {
    name: 'CSS',
    category: 'Web Technology',
    skill_url: 'https://www.youtube.com/watch?v=yfoY53QXEnI',
    description: 'Styling language for web pages',
    priority: 10
  },
  {
    name: 'Tailwind CSS',
    category: 'Web Technology',
    skill_url: 'https://www.youtube.com/watch?v=ft30zcMlFao',
    description: 'Utility-first CSS framework',
    priority: 7
  },

  // Testing
  {
    name: 'Unit Testing',
    category: 'Testing',
    skill_url: 'https://www.udemy.com/course/nodejs-unit-testing-in-depth/',
    description: 'Testing individual units of code',
    priority: 7
  },
  {
    name: 'Jest',
    category: 'Testing',
    skill_url: 'https://www.youtube.com/watch?v=7r4xVDI2vho',
    description: 'JavaScript testing framework',
    priority: 6
  },

  // Software Engineering Practices
  {
    name: 'Data Structures',
    category: 'Computer Science',
    skill_url: 'https://www.coursera.org/learn/data-structures',
    description: 'Fundamental data organization concepts',
    priority: 9
  },
  {
    name: 'Algorithms',
    category: 'Computer Science',
    skill_url: 'https://www.coursera.org/learn/algorithms-part1',
    description: 'Problem-solving and optimization techniques',
    priority: 9
  },
  {
    name: 'OOP',
    category: 'Programming Paradigm',
    skill_url: 'https://www.coursera.org/learn/object-oriented-programming',
    description: 'Object-Oriented Programming principles',
    priority: 8
  },
  {
    name: 'Design Patterns',
    category: 'Software Design',
    skill_url: 'https://www.udemy.com/course/design-patterns-in-javascript/',
    description: 'Reusable solutions to common problems',
    priority: 6
  },

  // Soft Skills & Methodologies
  {
    name: 'Agile',
    category: 'Methodology',
    skill_url: 'https://www.coursera.org/learn/agile-meets-design-thinking',
    description: 'Agile software development methodology',
    priority: 7
  },
  {
    name: 'Scrum',
    category: 'Methodology',
    skill_url: 'https://www.coursera.org/learn/scrum-master-certification',
    description: 'Framework for agile project management',
    priority: 6
  },

  // Cloud & Modern Tools
  {
    name: 'AWS',
    category: 'Cloud Platform',
    skill_url: 'https://www.coursera.org/learn/aws-fundamentals-going-cloud-native',
    description: 'Amazon Web Services cloud platform',
    priority: 6
  },
  {
    name: 'Firebase',
    category: 'Backend as a Service',
    skill_url: 'https://www.youtube.com/watch?v=9kRgVxULbag',
    description: 'Google\'s backend platform',
    priority: 5
  },
];

async function seedSkills() {
  console.log('🌱 Starting to seed skills database...\n');
  
  let successCount = 0;
  let errorCount = 0;

  for (const skill of essentialSkills) {
    try {
      const skillsCol = collection(db, 'skills');
      await addDoc(skillsCol, skill);
      console.log(`✅ Added: ${skill.name} (${skill.category})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to add ${skill.name}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n📊 Seed Summary:');
  console.log(`   ✅ Successfully added: ${successCount} skills`);
  console.log(`   ❌ Failed: ${errorCount} skills`);
  console.log(`   📝 Total: ${essentialSkills.length} skills`);
  console.log('\n✨ Seeding complete!');
  
  process.exit(0);
}

seedSkills().catch(error => {
  console.error('💥 Fatal error during seeding:', error);
  process.exit(1);
});
