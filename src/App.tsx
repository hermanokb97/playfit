import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import SensoryTouch from './games/SensoryTouch/SensoryTouch';
import FollowOrder from './games/FollowOrder/FollowOrder';
import EmotionPicker from './games/EmotionPicker/EmotionPicker';
import FollowCharacter from './games/FollowCharacter/FollowCharacter';
import BalloonChase from './games/BalloonChase/BalloonChase';
import LineTracing from './games/LineTracing/LineTracing';
import StarCollect from './games/StarCollect/StarCollect';
import MouseTrail from './games/MouseTrail/MouseTrail';
import NameWriting from './games/NameWriting/NameWriting';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/sensory-touch" element={<SensoryTouch />} />
      <Route path="/follow-order" element={<FollowOrder />} />
      <Route path="/emotion-picker" element={<EmotionPicker />} />
      <Route path="/follow-character" element={<FollowCharacter />} />
      <Route path="/balloon-chase" element={<BalloonChase />} />
      <Route path="/line-tracing" element={<LineTracing />} />
      <Route path="/star-collect" element={<StarCollect />} />
      <Route path="/mouse-trail" element={<MouseTrail />} />
      <Route path="/name-writing" element={<NameWriting />} />
    </Routes>
  );
}
