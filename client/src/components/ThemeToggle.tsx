import { Moon, Sun } from 'lucide-react';
import { useHandleTheme } from 'src/hooks/useHandleTheme';

export const ThemeToggle = () => {
  const { theme, setTheme } = useHandleTheme();

  const handleClick = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    window.location.reload();
  }

  const icon = theme === 'light' ? <Sun size={16} /> : <Moon size={16} />;
  
  return (
    <button onClick={handleClick} className='text-text-primary hover:text-text-tertiary cursor-pointer inline-flex items-center justify-center size-8 rounded-full hover:bg-background-hover  border border-border'>
      {icon}
    </button>
  )
}