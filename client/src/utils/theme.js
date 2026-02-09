//テーマカラーのプリセット
export const themes = {
    1: {//blue
        main: '#8eadd7',
        accent: '#f5d694',
        sub: '#F7F7F7',
        hover: '#455b7c',
        font: '#0d346b',
        hover2: '#082347',
        icon: '#fff',
    },
    2: {//pink
        main: '#F8CCD1',
        accent: '#b7a4ee',
        sub: '#F7F7F7',
        hover: '#be4f6f',
        font: '#550c28',
        hover2: '#20020d',
        icon: '#fff',
    },
    3: {//green
        main: '#8FD6B0',
        accent: '#f3fda4',
        sub: '#F7F9F8',
        hover: '#4b946d',
        font: '#1F4F3A',
        hover2: '#163C2C',
        icon: '#fff',
    },
    4: {//yellow
        main: '#FFE054',
        accent: '#0068B7',
        sub: '#FFFDF5',
        hover: '#FFD233',
        font: '#3A3A3A',
        hover2: '#003F73',
        icon: '#fff',
    },
    5: { // purple
        main: '#B7A5E3',
        accent: '#FFD6A5',
        sub: '#F8F7FC',
        hover: '#8E7CC3',
        font: '#3B2F5C',
        hover2: '#241A3D',
        icon: '#fff',
        },
    6: { // gray
        main: '#BFC3C9',
        accent: '#6B7A99',
        sub: '#F6F7F8',
        hover: '#A5AAB3',
        font: '#2E3440',
        hover2: '#1F2937',
        icon: '#6B7A99',
        },
    7: {//navy
        main: '#002A5B',
        accent: '#D7000F',
        sub: '#202b36',
        hover: '#003A7A',
        font: '#fff',
        hover2: '#858585',
        icon: '#fff',
    },
    99: {//dark
        main: '#000000',
        accent: '#707070',
        sub: '#121212',
        hover: '#2A2A2A',
        font: '#E6E6E6',
        hover2: '#FFFFFF',
        icon: '#fff',
    },

};
//テーマカラー設定の関数
export const applyTheme = (theme) => {
    if(!theme) return;

    const root = document.documentElement;//document.documentElement⇒HTML全体
    root.style.setProperty('--theme-main', theme.main);//setProperty：CSS変数を上書き
    root.style.setProperty('--theme-accent', theme.accent);
    root.style.setProperty('--theme-sub', theme.sub);
    root.style.setProperty('--theme-hover', theme.hover);
    root.style.setProperty('--theme-font', theme.font);
    root.style.setProperty('--theme-hover2', theme.hover2);
    root.style.setProperty('--theme-icon', theme.icon);
};
