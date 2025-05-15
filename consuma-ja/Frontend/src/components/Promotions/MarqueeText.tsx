"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, Animated, Easing, StyleSheet, type StyleProp, type TextStyle } from "react-native"

interface MarqueeTextProps {
  text: string
  style?: StyleProp<TextStyle>
  speed?: number // Velocidade da animação (menor = mais rápido)
  delay?: number // Atraso antes de iniciar a animação
  pauseAtEnd?: boolean // Pausa no final antes de reiniciar
  numberOfLines?: number // Número de linhas quando não está animando
}

const MarqueeText = ({
  text,
  style,
  speed = 0.05,
  delay = 1000,
  pauseAtEnd = true,
  numberOfLines = 1,
}: MarqueeTextProps) => {
  const [textWidth, setTextWidth] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const animation = useRef(new Animated.Value(0)).current
  const shouldAnimate = textWidth > containerWidth && containerWidth > 0

  useEffect(() => {
    if (shouldAnimate) {
      // Reinicia a animação
      animation.setValue(0)
      startAnimation()
    } else {
      // Se o texto couber no contêiner, não anima
      animation.setValue(0)
    }

    return () => {
      // Limpa a animação quando o componente for desmontado
      animation.stopAnimation()
    }
  }, [shouldAnimate, textWidth, containerWidth])

  // Função para iniciar a animação (usada para reiniciar após o término)
  const startAnimation = () => {
    if (shouldAnimate) {
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(animation, {
          toValue: -textWidth - 40,
          duration: textWidth * speed * 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        ...(pauseAtEnd ? [Animated.delay(delay)] : []),
      ]).start(() => {
        animation.setValue(0)
        startAnimation()
      })
    }
  }

  // Se o texto couber no contêiner, exibe normalmente com ellipsis
  if (!shouldAnimate) {
    return (
      <Text style={style} numberOfLines={numberOfLines} ellipsizeMode="tail">
        {text}
      </Text>
    )
  }

  // Se o texto não couber, exibe com animação
  return (
    <View
      style={[styles.marqueeContainer, { height: 20 }]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <Animated.View style={{ transform: [{ translateX: animation }] }}>
        <Text style={style} onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}>
          {text}
        </Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  marqueeContainer: {
    overflow: "hidden",
  },
})

export default MarqueeText
