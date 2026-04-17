import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import FastImage from 'react-native-fast-image'
import { folder } from '../../helper/ImageAssets'

const BonusHistory = () => {
  return (
      <View style={[{marginVertical: 20, borderRadius: 10, }]}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10,color:"#222" }}>Bouns History</Text>
                    <View style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 5,
                        backgroundColor: "#fff", 
                        borderRadius: 10, 
                        paddingHorizontal: 10
                    }}>
                        <View style={{ flexDirection: 'row', paddingVertical: 13, borderBottomWidth: 0.4, borderColor: '#D4D4D4',  justifyContent: 'space-evenly', }}>
                            <Text style={{ flex: 1, fontWeight: 'bold',color:'#222',fontSize:12,marginRight:20 }}>Registration Time(UTC)</Text>
                            <Text style={{ flex: 1, fontWeight: 'bold',color:'#222',fontSize:12, }}>UID</Text>
                            <Text style={{ flex: 1, fontWeight: 'bold',color:'#222',fontSize:12, }}>Advance KYC Tim</Text>
                        </View>

                        <View style={{ alignItems: 'center', paddingVertical: 70, justifyContent: "center" }}>
                            <FastImage source={folder} style={{ width: 80, height: 80, marginBottom: 10 }} />
                            <Text>No Data</Text>
                        </View>
                    </View>
                </View>
  )
}

export default BonusHistory

const styles = StyleSheet.create({})