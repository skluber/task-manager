import calendarIcon from '../assets/icons/month.svg';
import todayIcon from '../assets/icons/today.svg';
import allTasksIcon from '../assets/icons/all.svg';
import weekIcon from '../assets/icons/week.svg';
import trashIcon from '../assets/icons/trash.svg';
import avatarIcon from '../assets/icons/avatar.jpg';
import plusIcon from '../assets/icons/add.svg';

const iconRegistry = {
    calendar: calendarIcon,
    today: todayIcon,
    allTasks: allTasksIcon,
    week: weekIcon,
    trash: trashIcon,
    avatar: avatarIcon,
    plus: plusIcon
};

export class IconManager {
    static get(iconName) {
        if (!iconRegistry[iconName]) {
            console.warn(`IconManager: El icono "${iconName}" no existe en el registro.`);
            return '';
        }
        return iconRegistry[iconName];
    }
}