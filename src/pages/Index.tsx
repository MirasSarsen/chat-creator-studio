import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { useChat } from "@/hooks/useChat";
import { useTTS } from "@/hooks/useTTS";

const Index = () => {
  const {
    messages,
    isLoading,
    selectedModel,
    selectedAgent,
    setSelectedModel,
    setSelectedAgent,
    sendMessage,
    clearMessages,
  } = useChat();

  const { speak, isSpeaking } = useTTS();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Ambient glow effect */}
      <div
        className="fixed inset-0 pointer-events-none opacity-50"
        style={{ background: "var(--gradient-glow)" }}
      />

      {/* Sidebar */}
      <ChatSidebar
        selectedAgent={selectedAgent}
        onSelectAgent={(agent) => {
          setSelectedAgent(agent);
          clearMessages();
        }}
        onNewChat={clearMessages}
      />

      {/* Main Chat Area */}
      <ChatArea
        messages={messages}
        isLoading={isLoading}
        selectedModel={selectedModel}
        selectedAgent={selectedAgent}
        onSendMessage={sendMessage}
        onSelectModel={setSelectedModel}
        onSpeak={speak}
        isSpeaking={isSpeaking}
      />
    </div>
  );
};

export default Index;
