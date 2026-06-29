import React, { createContext, useState, useContext } from 'react';

const YumpickContext = createContext();

export const useYumpick = () => {
  const context = useContext(YumpickContext);
  if (!context) {
    throw new Error('useYumpick must be used within a YumpickProvider');
  }
  return context;
};

// Preset gallery items (mock photos)
const PRESET_GALLERY_IMAGES = [
  {
    id: 'gallery-1',
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ingredients: ['토마토', '달걀', '양파', '올리브유'],
    title: '신선한 토마토와 계란'
  },
  {
    id: 'gallery-2',
    url: 'https://images.unsplash.com/photo-1566385278603-60576db70855?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ingredients: ['닭고기', '당근', '감자', '양파', '대파'],
    title: '닭도리탕용 식재료 바구니'
  },
  {
    id: 'gallery-3',
    url: 'https://images.unsplash.com/photo-1624462966581-bc6d768cbce5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ingredients: ['삼겹살', '마늘', '양송이버섯', '쌈장'],
    title: '고기구이 재료'
  },
  {
    id: 'gallery-4',
    url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ingredients: ['파스타면', '베이컨', '마늘', '올리브유', '치즈'],
    title: '오일 파스타 식재료'
  }
];

// Mock Recipes database
const MOCK_RECIPES = [
  {
    id: 'recipe-1',
    name: '토마토 달걀 볶음',
    time: 15,
    difficulty: '쉬움',
    cutting: '낮음',
    washing: '적음',
    spiciness: '안 매움',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ingredients: ['토마토', '달걀', '양파', '올리브유', '소금', '설탕'],
    description: '15분 완성! 아침 식사로 안성맞춤인 부드럽고 새콤달콤한 토마토 달걀 볶음입니다.',
    steps: [
      '토마토는 깨끗이 씻어 한 입 크기(8등분)로 썰고 양파는 채 썹니다.',
      '볼에 달걀을 풀고 소금을 한 꼬집 넣어 잘 섞어둡니다.',
      '달군 팬에 식용유(올리브유)를 두르고 달걀물을 부어 스크램블을 만들어 따로 덜어둡니다.',
      '같은 팬에 올리브유를 조금 더 두르고 채 썬 양파를 볶아 향을 냅니다.',
      '양파가 투명해지면 토마토를 넣고 즙이 나올 때까지 볶아줍니다. 설탕과 소금으로 간을 맞춥니다.',
      '토마토가 부드러워지면 미리 만들어둔 스크램블 에그를 넣고 가볍게 섞은 후 불을 끕니다.'
    ]
  },
  {
    id: 'recipe-2',
    name: '얼큰 닭볶음탕',
    time: 45,
    difficulty: '보통',
    cutting: '보통',
    washing: '보통',
    spiciness: '매움',
    image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ingredients: ['닭고기', '당근', '감자', '양파', '대파', '고추장', '간장', '다진마늘', '설탕'],
    description: '칼칼하고 달콤 짭조름한 양념이 쏙 배어 밥 한 공기 뚝딱 비우는 매콤 닭볶음탕입니다.',
    steps: [
      '닭고기는 끓는 물에 살짝 데쳐 불순물을 제거하고 찬물에 헹궈둡니다.',
      '감자와 당근은 큼직하게 둥글려 썰고, 양파는 크게 사각 썰기, 대파는 어긋 썹니다.',
      '양념장(고추장 2큰술, 간장 4큰술, 고춧가루 2큰술, 다진마늘 1.5큰술, 설탕 2큰술)을 만들어 둡니다.',
      '냄비에 닭과 물 3컵, 양념장을 넣고 끓여줍니다.',
      '끓기 시작하면 감자와 당근을 넣고 불을 중불로 줄여 20분간 졸이듯이 끓입니다.',
      '감자가 다 익으면 양파와 대파를 넣고 5~10분간 국물이 자작해질 때까지 조려줍니다.'
    ]
  },
  {
    id: 'recipe-3',
    name: '초간단 갈릭 베이컨 파스타',
    time: 20,
    difficulty: '보통',
    cutting: '낮음',
    washing: '적음',
    spiciness: '안 매움',
    image: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ingredients: ['파스타면', '베이컨', '마늘', '올리브유', '소금'],
    description: '은은한 마늘 향과 고소한 베이컨이 어우러져 레스토랑 못지않은 풍미를 자랑하는 파스타입니다.',
    steps: [
      '냄비에 물을 넉넉히 끓여 소금 1큰술과 파스타면을 넣고 알단테(약 8분)로 삶습니다. 면수는 버리지 마세요.',
      '마늘은 편 썰어 준비하고 베이컨은 1.5cm 크기로 자릅니다.',
      '팬에 올리브유를 4큰술 넉넉히 두르고 슬라이스한 마늘을 약불에서 노릇하게 볶아 기름에 향을 입힙니다.',
      '베이컨을 넣고 바삭해질 때까지 중불에서 함께 볶아줍니다.',
      '삶아진 파스타면과 면수 반 컵을 넣어 기름과 면수가 잘 에멀전(유화)되도록 팬을 힘차게 흔들며 볶습니다.',
      '마지막으로 통후추와 소금으로 간을 하고 접시에 담아 치즈 가루나 파슬리를 솔솔 뿌려냅니다.'
    ]
  },
  {
    id: 'recipe-4',
    name: '삼겹살 버섯 구이',
    time: 15,
    difficulty: '쉬움',
    cutting: '낮음',
    washing: '적음',
    spiciness: '안 매움',
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ingredients: ['삼겹살', '양송이버섯', '마늘', '참기름', '소금', '쌈장'],
    description: '노릇노릇 잘 구운 삼겹살과 즙이 꽉 찬 버섯 구이의 환상적인 만남!',
    steps: [
      '삼겹살은 먹기 좋은 크기로 썰고 양송이버섯은 밑동만 가볍게 떼어냅니다. 마늘은 편 썹니다.',
      '달군 팬에 삼겹살과 편마늘을 올리고 앞뒤로 노릇하게 소금을 톡톡 뿌려가며 굽습니다.',
      '삼겹살 기름이 나오면 양송이버섯을 뒤집어서 올려 버섯 안에 즙이 가득 고일 때까지 함께 굽습니다.',
      '다 구워진 고기와 버섯을 그릇에 담고 쌈장과 참기름소금장을 곁들여 먹습니다.'
    ]
  }
];

export const YumpickProvider = ({ children }) => {
  // 1. User preferences (UserInfo)
  const [selectedSeasonings, setSelectedSeasonings] = useState(['간장', '설탕', '소금', '다진마늘', '참기름']);
  const [selectedTools, setSelectedTools] = useState(['칼', '뒤집개', '집게']);
  const [selectedAppliances, setSelectedAppliances] = useState(['가스레인지/인덕션', '전자레인지']);

  // 2. Camera & Gallery photo selection
  const [currentImage, setCurrentImage] = useState(null); // Base64 or ObjectURL or mock url

  // 3. Detected ingredients list (Detection.jsx)
  const [detectedIngredients, setDetectedIngredients] = useState([]);

  // 4. Filters selection (Filter.jsx)
  const [filters, setFilters] = useState({
    difficulty: '보통',
    time: 30,
    cutting: '보통',
    washing: '보통',
    spiciness: '조금 매움'
  });

  // Selected recipe detail for Recipe.jsx
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);

  // Auto-detect ingredients based on selected mock image
  const handlePhotoSelect = (imageUrl, ingredients) => {
    setCurrentImage(imageUrl);
    setDetectedIngredients(ingredients || ['양파', '토마토', '달걀']);
  };

  // Re-recommend trigger (randomize order of recommendation list for demo)
  const [recommends, setRecommends] = useState(MOCK_RECIPES);
  
  const shuffleRecommendations = () => {
    setRecommends([...MOCK_RECIPES].sort(() => Math.random() - 0.5));
  };

  return (
    <YumpickContext.Provider
      value={{
        selectedSeasonings,
        setSelectedSeasonings,
        selectedTools,
        setSelectedTools,
        selectedAppliances,
        setSelectedAppliances,
        currentImage,
        setCurrentImage,
        detectedIngredients,
        setDetectedIngredients,
        filters,
        setFilters,
        selectedRecipeId,
        setSelectedRecipeId,
        presets: PRESET_GALLERY_IMAGES,
        recipes: MOCK_RECIPES,
        recommendedRecipes: recommends,
        shuffleRecommendations,
        handlePhotoSelect
      }}
    >
      {children}
    </YumpickContext.Provider>
  );
};
