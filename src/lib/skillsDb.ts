import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where,
  DocumentData 
} from 'firebase/firestore';

export interface Skill {
  id?: string;
  name: string;
  category: string;
  skill_url: string;
  description?: string;
  priority?: number;
}

const SKILLS_COLLECTION = 'skills';

/**
 * Get all skills from Firestore
 */
export async function getAllSkills(): Promise<Skill[]> {
  try {
    const skillsCol = collection(db, SKILLS_COLLECTION);
    const snapshot = await getDocs(skillsCol);
    
    const skills: Skill[] = [];
    snapshot.forEach((doc) => {
      skills.push({
        id: doc.id,
        ...doc.data() as Omit<Skill, 'id'>
      });
    });
    
    return skills;
  } catch (error) {
    console.error('Error fetching skills:', error);
    return [];
  }
}

/**
 * Get skills by category
 */
export async function getSkillsByCategory(category: string): Promise<Skill[]> {
  try {
    const skillsCol = collection(db, SKILLS_COLLECTION);
    const q = query(skillsCol, where('category', '==', category));
    const snapshot = await getDocs(q);
    
    const skills: Skill[] = [];
    snapshot.forEach((doc) => {
      skills.push({
        id: doc.id,
        ...doc.data() as Omit<Skill, 'id'>
      });
    });
    
    return skills;
  } catch (error) {
    console.error('Error fetching skills by category:', error);
    return [];
  }
}

/**
 * Find missing skills by comparing current skills with database skills
 */
export async function findMissingSkills(currentSkills: string[]): Promise<Skill[]> {
  try {
    const allSkills = await getAllSkills();
    
    // Normalize current skills to lowercase for comparison
    const normalizedCurrentSkills = currentSkills.map(skill => 
      skill.toLowerCase().trim()
    );
    
    // Filter skills that are not in current skills
    const missingSkills = allSkills.filter(skill => {
      const skillName = skill.name.toLowerCase().trim();
      return !normalizedCurrentSkills.includes(skillName);
    });
    
    // Sort by priority (higher priority first)
    return missingSkills.sort((a, b) => 
      (b.priority || 0) - (a.priority || 0)
    );
  } catch (error) {
    console.error('Error finding missing skills:', error);
    return [];
  }
}

/**
 * Add a new skill to Firestore
 */
export async function addSkill(skill: Omit<Skill, 'id'>): Promise<string | null> {
  try {
    const skillsCol = collection(db, SKILLS_COLLECTION);
    const docRef = await addDoc(skillsCol, skill);
    return docRef.id;
  } catch (error) {
    console.error('Error adding skill:', error);
    return null;
  }
}

/**
 * Batch add multiple skills
 */
export async function addMultipleSkills(skills: Omit<Skill, 'id'>[]): Promise<number> {
  let successCount = 0;
  
  for (const skill of skills) {
    const id = await addSkill(skill);
    if (id) successCount++;
  }
  
  return successCount;
}
