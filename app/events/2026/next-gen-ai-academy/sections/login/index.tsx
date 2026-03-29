"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaRobot } from "react-icons/fa";
import { SiJupyter, SiOpenai, SiPython } from "react-icons/si";
import {
  TbBrain,
  TbBrandPython,
  TbDatabase,
  TbMessageChatbot,
  TbPrompt,
  TbSparkles,
  TbTerminal2,
} from "react-icons/tb";

export const AILogin = () => {
  return (
    <section
      className="min-h-screen flex items-center justify-center sm:py-24 bg-linear-to-r from-purple-600 to-violet-800 relative overflow-hidden"
      id="login"
    >
      {/* Grid background */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="smallGrid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
            <pattern
              id="grid"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <rect width="80" height="80" fill="url(#smallGrid)" />
              <path
                d="M 80 0 L 0 0 0 80"
                fill="none"
                stroke="white"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Floating AI icons */}
      <div className="absolute inset-0 opacity-30">
        <div className="random-icons-container">
          {Array.from({ length: 24 }).map((_, index) => {
            const posX = (index * 19) % 100;
            const posY = (index * 13 + 7) % 100;
            const rotation = ((index * 17) % 360) - 180;
            const iconIndex = index % 10;

            let Icon;
            let color;

            switch (iconIndex) {
              case 0:
                Icon = SiPython;
                color = "text-green-400";
                break;
              case 1:
                Icon = TbBrain;
                color = "text-purple-300";
                break;
              case 2:
                Icon = SiOpenai;
                color = "text-emerald-300";
                break;
              case 3:
                Icon = FaRobot;
                color = "text-violet-300";
                break;
              case 4:
                Icon = TbTerminal2;
                color = "text-orange-300";
                break;
              case 5:
                Icon = TbSparkles;
                color = "text-teal-300";
                break;
              case 6:
                Icon = TbMessageChatbot;
                color = "text-white";
                break;
              case 7:
                Icon = TbBrandPython;
                color = "text-green-300";
                break;
              case 8:
                Icon = SiJupyter;
                color = "text-orange-400";
                break;
              case 9:
                Icon = TbDatabase;
                color = "text-blue-300";
                break;
              default:
                Icon = TbPrompt;
                color = "text-gray-300";
            }

            const size = 30 + ((index * 11) % 40);
            const opacity = 0.6 + ((index * 7) % 5) / 10;

            return (
              <motion.div
                key={`icon-${index}`}
                className={`random-icon ${color}`}
                style={{
                  position: "absolute",
                  left: `${posX}%`,
                  top: `${posY}%`,
                  transform: `rotate(${rotation}deg)`,
                  opacity: opacity,
                }}
                animate={{
                  y: [0, -10 + (index % 5) * 2, 0],
                  x: [0, index % 2 ? 8 : -8, 0],
                  rotate: [
                    rotation,
                    rotation + (index % 2 ? 10 : -10),
                    rotation,
                  ],
                }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 3 + (index % 4),
                  delay: (index * 0.2) % 2,
                }}
              >
                <Icon size={size} />
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col justify-center text-center">
          <motion.h1
            className="text-2xl sm:text-3xl font-extrabold text-white"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0, ease: "easeOut" }}
          >
            รับจำนวนจำกัด (20 คน)
          </motion.h1>

          <motion.p
            className="mt-4 text-base sm:text-lg md:text-xl text-purple-100"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.75, ease: "easeOut" }}
          ></motion.p>

          <div className="mt-3 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.75, ease: "easeOut" }}
            >
              <Link href="/events/2026/next-gen-ai-academy/application">
                <button
                  className="px-6 text-2xl font-bold sm:px-8 py-2 sm:py-3 bg-emerald-500 text-white rounded-lg shadow-lg hover:bg-emerald-600 transition duration-300 flex items-center"
                  style={{ cursor: "pointer" }}
                >
                  คลิกเพื่อสมัครเลย
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Python code snippet (left) */}
      <div className="absolute left-8 top-1/4 transform -translate-y-1/2 hidden lg:block">
        <motion.div
          className="bg-gray-800 bg-opacity-70 rounded-lg p-4 text-left text-xs text-gray-200 font-mono"
          initial={{ x: -100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <pre className="whitespace-pre overflow-x-auto">
            <div>
              <span className="text-purple-300">import</span>{" "}
              <span className="text-green-300">openai</span>
            </div>
            <div></div>
            <div>
              <span className="text-blue-300">client</span> ={" "}
              <span className="text-green-300">openai</span>.
              <span className="text-yellow-300">OpenAI</span>()
            </div>
            <div></div>
            <div>
              <span className="text-blue-300">response</span> ={" "}
              <span className="text-blue-300">client</span>.
              <span className="text-yellow-300">chat</span>.
              <span className="text-yellow-300">completions</span>.
              <span className="text-yellow-300">create</span>(
            </div>
            <div>
              {"  "}
              <span className="text-blue-300">model</span>=
              <span className="text-green-300">&quot;gpt-4&quot;</span>,
            </div>
            <div>
              {"  "}
              <span className="text-blue-300">messages</span>=[{"{"}
            </div>
            <div>
              {"    "}
              <span className="text-green-300">&quot;role&quot;</span>:{" "}
              <span className="text-green-300">&quot;user&quot;</span>,
            </div>
            <div>
              {"    "}
              <span className="text-green-300">&quot;content&quot;</span>:{" "}
              <span className="text-green-300">&quot;Hello AI!&quot;</span>
            </div>
            <div>{"  "}{"}"}{"]"}</div>
            <div>)</div>
          </pre>
        </motion.div>
      </div>

      {/* Claude prompt snippet (right) */}
      <div className="absolute right-8 bottom-1/4 transform translate-y-1/2 hidden lg:block">
        <motion.div
          className="bg-gray-800 bg-opacity-70 rounded-lg p-4 text-left text-xs text-gray-200 font-mono"
          initial={{ x: 100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <pre className="whitespace-pre overflow-x-auto">
            <div className="text-gray-400"># AI Prompt Template</div>
            <div></div>
            <div>
              <span className="text-purple-300">def</span>{" "}
              <span className="text-yellow-300">generate_prompt</span>(
              <span className="text-blue-300">task</span>):
            </div>
            <div>
              {"  "}
              <span className="text-purple-300">return</span>{" "}
              <span className="text-green-300">f&quot;&quot;&quot;</span>
            </div>
            <div>
              {"  "}
              <span className="text-green-300">
                You are a helpful assistant.
              </span>
            </div>
            <div>
              {"  "}
              <span className="text-green-300">
                Task: {"{"}task{"}"}
              </span>
            </div>
            <div>
              {"  "}
              <span className="text-green-300">
                Think step by step.
              </span>
            </div>
            <div>
              {"  "}
              <span className="text-green-300">&quot;&quot;&quot;</span>
            </div>
          </pre>
        </motion.div>
      </div>
    </section>
  );
};
